const { randomUUID } = require("crypto");
const { restoreBattle } = require("../persistence/battleRecord");
const { chooseNpcAction } = require("../../utils/battleUtils");
const { logger } = require("../../log");

/**
 * Surface-neutral battle reads and actions. Authorization belongs here, not
 * in Discord component handlers or a future HTTP route.
 */
class BattleService {
  constructor(store, {
    maxNpcActions = 300,
    npcAction = chooseNpcAction,
    onCompleted = null,
  } = {}) {
    this.store = store;
    this.maxNpcActions = maxNpcActions;
    this.npcAction = npcAction;
    this.onCompleted = onCompleted;
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
    await this.advanceNpcs(record._id);
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
    if (record.completionStatus === "pending") {
      await this.settleCompletion(battleId);
    }
    const latest = record.completionStatus === "pending"
      ? await this.store.get(battleId)
      : record;
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

    await this.advanceNpcs(battleId);
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

  async settleCompletion(battleId) {
    if (!this.onCompleted) return;
    const claimId = randomUUID();
    if (!await this.store.claimCompletion(battleId, claimId)) return;
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

  async advanceNpcs(battleId) {
    for (let count = 0; count < this.maxNpcActions; count += 1) {
      const record = await this.store.get(battleId);
      if (record.status !== "active") return record;
      const battle = restoreBattle(record);
      const actorUserId = battle.activePokemon?.userId;
      if (!actorUserId || !battle.isNpc(actorUserId)) return record;

      const result = await this.store.submit({
        battleId,
        actorUserId,
        expectedRevision: record.revision,
        requestId: `npc:${record.revision}`,
        action: this.npcAction(battle),
      });
      if (!result.accepted && !["stale_revision", "request_id_conflict"].includes(result.reason)) {
        throw new Error(`NPC action rejected: ${result.reason}`);
      }
    }
    throw new Error(`NPC progression exceeded ${this.maxNpcActions} actions`);
  }
}

module.exports = { BattleService };
