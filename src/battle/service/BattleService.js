const { randomUUID } = require("crypto");
const { restoreBattle } = require("../persistence/battleRecord");
const { chooseNpcAction } = require("../../utils/battleUtils");
const { logger } = require("../../log");
const { simulateAutoBattle } = require("./simulateAutoBattle");

/**
 * Surface-neutral battle reads and actions. Authorization belongs here, not
 * in Discord component handlers or a future HTTP route.
 */
class BattleService {
  constructor(
    store,
    {
      maxNpcActions = 300,
      npcAction = chooseNpcAction,
      onCompleted = null,
      autoEligibility = null,
      autoCharge = null,
      autoAction = chooseNpcAction,
      maxAutoActions = 300,
      yieldAuto,
    } = {},
  ) {
    this.store = store;
    this.maxNpcActions = maxNpcActions;
    this.npcAction = npcAction;
    this.onCompleted = onCompleted;
    this.autoEligibility = autoEligibility;
    this.autoCharge = autoCharge;
    this.autoAction = autoAction;
    this.maxAutoActions = maxAutoActions;
    this.yieldAuto = yieldAuto;
  }

  /**
   * @param {{ battle: Battle, mode?: object, idleTimeoutMs?: number,
   *   modeDeadlineAt?: Date, resultRetentionMs?: number }} options
   */
  async start({
    battle,
    mode = {},
    idleTimeoutMs,
    modeDeadlineAt,
    resultRetentionMs,
  }) {
    const record = await this.store.create({
      battle,
      mode,
      idleTimeoutMs,
      modeDeadlineAt,
      resultRetentionMs,
    });
    await this.advanceAutomaticTurns(record._id);
    await this.settleCompletion(record._id);
    const latest = await this.store.get(record._id);
    return {
      battleId: latest._id,
      revision: latest.revision,
      status: latest.status,
      mode: latest.mode,
      view: latest.view,
    };
  }

  async listActive(userId) {
    const records = await this.store.listActive(userId);
    return records.map((record) => ({
      battleId: record._id,
      revision: record.revision,
      mode: record.mode,
      view: record.view,
      updatedAt: record.updatedAt,
      expiresAt: record.expiresAt,
    }));
  }

  async get({ battleId, userId, sinceRevision = null }) {
    const record = await this.store.get(battleId);
    if (!record || !record.participantIds.includes(userId)) {
      return { found: false };
    }
    if (record.resultExpiresAt && record.resultExpiresAt <= this.store.now()) {
      return { found: false };
    }
    const progressed = record.status === "active" && record.needsAutomaticTurn !== false
      ? await this.advanceAutomaticTurns(battleId) : record;
    if (progressed.completionStatus === "pending") {
      await this.settleCompletion(battleId);
    }
    const latest =
      progressed.completionStatus === "pending"
        ? await this.store.get(battleId)
        : progressed;
    return {
      found: true,
      battleId,
      revision: latest.revision,
      status: latest.status,
      completionStatus: latest.completionStatus,
      mode: latest.mode,
      view: latest.view,
      updates:
        sinceRevision === null
          ? []
          : latest.actions.filter((entry) => entry.revision > sinceRevision),
    };
  }

  async act({ battleId, userId, expectedRevision, requestId, action }) {
    const record = await this.store.get(battleId);
    if (!record || !record.participantIds.includes(userId)) {
      return { accepted: false, reason: "battle_not_found" };
    }
    const result = await this.store.submit({
      battleId,
      actorUserId: userId,
      expectedRevision,
      requestId,
      action,
    });
    if (!result.accepted) return result;

    await this.advanceAutomaticTurns(battleId);
    await this.settleCompletion(battleId);
    const latest = await this.store.get(battleId);
    return {
      accepted: true,
      duplicate: result.duplicate,
      revision: latest.revision,
      status: latest.status,
      view: latest.view,
      updates: latest.actions.filter(
        (entry) => entry.revision > expectedRevision,
      ),
    };
  }

  /**
   * Live account capability, shared by Discord and future web Auto controls.
   * @param {object} record
   * @param {Battle} battle
   * @param {string} userId
   */
  async getAutoAvailability(record, battle, userId) {
    const cost = battle.autoData.autoBattleCost;
    const unavailable = (reason) => ({
      visible: false,
      enabled: false,
      cost,
      reason,
    });
    if (!record.participantIds.includes(userId))
      return unavailable("battle_not_found");
    if (record.status !== "active" || battle.ended)
      return unavailable("battle_inactive");
    if (record.autoCommit) return unavailable("auto_in_progress");
    // Never take control of another human's Pokémon, including cooperative modes.
    if (battle.isPvp || record.participantIds.length !== 1)
      return unavailable("auto_unsupported");
    if (battle.activePokemon?.userId !== userId)
      return unavailable("wrong_actor");
    if (
      !this.autoEligibility ||
      !this.autoCharge ||
      !Number.isFinite(cost) ||
      cost < 0
    )
      return unavailable("auto_unavailable");
    return { ...(await this.autoEligibility({ userId, cost })), cost };
  }

  /**
   * Simulate privately; take a short revision-checked claim only to charge/commit.
   * @param {{battleId: string, userId: string, expectedRevision: number, requestId: string}} options
   */
  async auto({ battleId, userId, expectedRevision, requestId }) {
    if (!requestId || !Number.isInteger(expectedRevision))
      throw new Error("Auto requires requestId and expectedRevision");
    const record = await this.store.get(battleId);
    if (!record || !record.participantIds.includes(userId))
      return { accepted: false, reason: "battle_not_found" };
    if (record.autoResult?.requestId === requestId) {
      if (
        record.autoResult.userId !== userId ||
        record.autoResult.baseRevision !== expectedRevision
      )
        return this.store.rejected("request_id_conflict", record);
      await this.settleCompletion(battleId);
      return { accepted: true, duplicate: true };
    }
    if (record.revision !== expectedRevision)
      return this.store.rejected("stale_revision", record);
    if (record.autoCommit)
      return this.store.rejected("auto_in_progress", record);
    const battle = restoreBattle(record);
    const availability = await this.getAutoAvailability(record, battle, userId);
    if (!availability.enabled)
      return this.store.rejected(availability.reason, record);

    const simulation = await simulateAutoBattle(battle, {
      chooseAction: this.autoAction,
      maxActions: this.maxAutoActions,
      yieldControl: this.yieldAuto,
    });
    if (!simulation.completed)
      return this.store.rejected(
        simulation.reason,
        await this.store.get(battleId),
      );
    const claim = {
      claimId: randomUUID(),
      requestId,
      userId,
      cost: availability.cost,
    };
    if (!(await this.store.claimAuto(battleId, expectedRevision, claim))) {
      const latest = await this.store.get(battleId);
      if (
        latest.autoResult?.requestId === requestId &&
        latest.autoResult.userId === userId
      )
        return { accepted: true, duplicate: true };
      return this.store.rejected(
        latest.autoCommit ? "auto_in_progress" : "stale_revision",
        latest,
      );
    }
    try {
      const payment = await this.autoCharge({ userId, cost: claim.cost });
      if (!payment.paid) {
        await this.store.releaseAuto(battleId, claim.claimId);
        return this.store.rejected(
          payment.reason || "auto_payment_failed",
          await this.store.get(battleId),
        );
      }
      await this.store.finishAuto(
        battleId,
        expectedRevision,
        claim,
        simulation,
      );
    } catch (error) {
      // A payment timeout may have debited money. Never release/retry an uncertain charge.
      logger.error(`Battle ${battleId} Auto requires review: ${error}`);
      await this.store.failAuto(battleId, claim.claimId, error);
      return this.store.rejected(
        "auto_requires_review",
        await this.store.get(battleId),
      );
    }
    await this.settleCompletion(battleId);
    return { accepted: true, duplicate: false };
  }

  async settleCompletion(battleId) {
    if (!this.onCompleted) return;
    const claimId = randomUUID();
    if (!(await this.store.claimCompletion(battleId, claimId))) return;
    try {
      const record = await this.store.get(battleId);
      const summary = await this.onCompleted(restoreBattle(record), record);
      await this.store.finishCompletion(battleId, claimId, { summary });
    } catch (error) {
      logger.error(`Battle ${battleId} completion requires review: ${error}`);
      await this.store.finishCompletion(battleId, claimId, {
        error: String(error),
      });
    }
  }

  async advanceAutomaticTurns(battleId) {
    for (let count = 0; count < this.maxNpcActions; count += 1) {
      const record = await this.store.get(battleId);
      if (record.status !== "active" || record.autoCommit) return record;
      const battle = restoreBattle(record);
      const actorUserId = battle.activePokemon?.userId;
      if (!actorUserId) return record;
      const isNpc = battle.isNpc(actorUserId);
      if (!isNpc && battle.activePokemon.canMove()) {
        if (record.needsAutomaticTurn !== false) {
          await this.store.markAutomaticTurnsSettled(battleId, record.revision);
        }
        return record;
      }

      const result = await this.store.submit({
        battleId,
        actorUserId,
        expectedRevision: record.revision,
        requestId: `${isNpc ? "npc" : "forced-skip"}:${record.revision}`,
        action: isNpc ? this.npcAction(battle) : { action: "skipTurn" },
      });
      if (!result.accepted && result.reason === "auto_in_progress")
        return this.store.get(battleId);
      if (
        !result.accepted &&
        !["stale_revision", "request_id_conflict"].includes(result.reason)
      ) {
        throw new Error(`Automatic battle action rejected: ${result.reason}`);
      }
    }
    throw new Error(`Automatic battle progression exceeded ${this.maxNpcActions} actions`);
  }
}

module.exports = { BattleService };
