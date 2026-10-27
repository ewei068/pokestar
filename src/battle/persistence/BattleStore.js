const {
  BATTLE_RULESET_VERSION,
  captureBattleSetup,
  restoreBattle,
} = require("./battleRecord");

const sameAction = (left, right) => {
  if (!left || !right) return false;
  return (
    JSON.stringify(Object.entries(left).sort()) ===
    JSON.stringify(Object.entries(right).sort())
  );
};

const DEFAULT_IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RESULT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

const needsAutomaticTurn = (battle) => Boolean(!battle.ended && battle.activePokemon &&
  (battle.isNpc(battle.activePokemon.userId) || !battle.activePokemon.canMove()));

const getExpiry = (now, idleTimeoutMs, modeDeadlineAt) => {
  const idleExpiry = new Date(now.getTime() + idleTimeoutMs);
  return modeDeadlineAt && modeDeadlineAt < idleExpiry
    ? modeDeadlineAt
    : idleExpiry;
};

/**
 * Mongo-backed durable battle actions. The collection must have a unique _id.
 */
class BattleStore {
  constructor(collection, { now = () => new Date() } = {}) {
    this.collection = collection;
    this.now = now;
  }

  /**
   * @param {object} options
   * @param {Battle} options.battle
   * @param {object=} options.mode
   * @param {number=} options.idleTimeoutMs
   * @param {Date=} options.modeDeadlineAt
   * @param {number=} options.resultRetentionMs
   */
  async create({
    battle,
    mode = {},
    idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
    modeDeadlineAt = null,
    resultRetentionMs = DEFAULT_RESULT_RETENTION_MS,
  }) {
    if (idleTimeoutMs <= 0 || resultRetentionMs <= 0) {
      throw new Error("Battle timeouts must be positive");
    }
    const setup = captureBattleSetup(battle);
    battle.start();
    const now = this.now();
    const record = {
      _id: battle.id,
      rulesetVersion: BATTLE_RULESET_VERSION,
      revision: 0,
      status: "active",
      participantIds: Object.values(battle.teams)
        .filter((team) => !team.isNpc)
        .flatMap((team) => team.userIds),
      mode: JSON.parse(JSON.stringify(mode)),
      setup,
      actions: [],
      view: battle.takeSnapshot(),
      needsAutomaticTurn: needsAutomaticTurn(battle),
      createdAt: now,
      updatedAt: now,
      expiresAt: getExpiry(now, idleTimeoutMs, modeDeadlineAt),
      modeDeadlineAt,
      idleTimeoutMs,
      resultRetentionMs,
      resultExpiresAt: null,
      completionStatus: "not_due",
    };
    await this.collection.insertOne(record);
    return record;
  }

  async get(battleId) {
    const record = await this.collection.findOne({ _id: battleId });
    if (
      record?.status === "active" &&
      !record.autoCommit &&
      record.expiresAt &&
      record.expiresAt <= this.now()
    ) {
      const now = this.now();
      await this.collection.updateOne(
        {
          _id: battleId,
          status: "active",
          autoCommit: null,
          expiresAt: { $lte: now },
        },
        {
          $set: {
            status: "expired",
            closedAt: now,
            updatedAt: now,
            resultExpiresAt: new Date(now.getTime() + record.resultRetentionMs),
          },
        },
      );
      return this.collection.findOne({ _id: battleId });
    }
    return record;
  }

  async listActive(userId) {
    const records = await this.collection
      .find({ participantIds: userId, status: "active" })
      .toArray();
    return records.filter(
      (record) => !record.expiresAt || record.expiresAt > this.now(),
    );
  }

  async markAutomaticTurnsSettled(battleId, revision) {
    await this.collection.updateOne(
      { _id: battleId, revision, status: "active" },
      { $set: { needsAutomaticTurn: false } },
    );
  }

  /**
   * Compare-and-swap on revision so Discord and web cannot both advance one turn.
   * @param {object} args
   * @param {string} args.battleId
   * @param {string} args.actorUserId
   * @param {number} args.expectedRevision
   * @param {string} args.requestId
   * @param {object} args.action
   */
  async submit({ battleId, actorUserId, expectedRevision, requestId, action }) {
    if (!requestId || !Number.isInteger(expectedRevision)) {
      throw new Error("Battle actions require requestId and expectedRevision");
    }
    const record = await this.get(battleId);
    if (!record) {
      return { accepted: false, reason: "battle_not_found" };
    }
    const prior = record.actions.find((entry) => entry.requestId === requestId);
    if (prior) {
      if (
        prior.actorUserId !== actorUserId ||
        !sameAction(prior.action, action)
      ) {
        return this.rejected("request_id_conflict", record);
      }
      return {
        accepted: true,
        duplicate: true,
        update: prior,
        revision: record.revision,
        view: record.view,
      };
    }
    if (record.status !== "active") {
      return this.rejected(
        record.status === "expired" ? "battle_expired" : "battle_inactive",
        record,
      );
    }
    if (record.autoCommit) return this.rejected("auto_in_progress", record);
    if (record.expiresAt && record.expiresAt <= this.now()) {
      return this.rejected("battle_expired", record);
    }
    if (record.revision !== expectedRevision) {
      return this.rejected("stale_revision", record);
    }

    const battle = restoreBattle(record);
    if (battle.activePokemon?.userId !== actorUserId) {
      return this.rejected("wrong_actor", record);
    }
    const outcome = battle.performAction(action);
    if (!outcome.accepted) {
      return this.rejected(outcome.reason, record);
    }

    const nextRevision = record.revision + 1;
    const now = this.now();
    const update = {
      revision: nextRevision,
      requestId,
      actorUserId,
      action: { ...action },
      events: outcome.events,
      log: outcome.log,
    };
    const result = await this.collection.updateOne(
      {
        _id: battleId,
        revision: record.revision,
        status: "active",
        autoCommit: null,
        expiresAt: { $gt: now },
      },
      {
        $set: {
          revision: nextRevision,
          status: battle.ended ? "completed" : "active",
          view: outcome.snapshot,
          needsAutomaticTurn: needsAutomaticTurn(battle),
          updatedAt: now,
          expiresAt: battle.ended
            ? null
            : getExpiry(now, record.idleTimeoutMs, record.modeDeadlineAt),
          resultExpiresAt: null,
          completedAt: battle.ended ? now : null,
          completionStatus: battle.ended ? "pending" : "not_due",
        },
        $push: { actions: update },
      },
    );
    if (result.modifiedCount !== 1) {
      const latest = await this.get(battleId);
      const committed = latest.actions.find(
        (entry) => entry.requestId === requestId,
      );
      if (committed) {
        if (
          committed.actorUserId !== actorUserId ||
          !sameAction(committed.action, action)
        ) {
          return this.rejected("request_id_conflict", latest);
        }
        return {
          accepted: true,
          duplicate: true,
          update: committed,
          revision: latest.revision,
          view: latest.view,
        };
      }
      return this.rejected(
        latest.autoCommit ? "auto_in_progress" : "stale_revision",
        latest,
      );
    }
    return {
      accepted: true,
      duplicate: false,
      update,
      revision: nextRevision,
      view: outcome.snapshot,
    };
  }

  /**
   * Claim only the payment/final-write phase, after the private simulation.
   * @param {string} battleId
   * @param {number} expectedRevision
   * @param {object} claim
   */
  async claimAuto(battleId, expectedRevision, claim) {
    const now = this.now();
    const result = await this.collection.updateOne(
      {
        _id: battleId,
        revision: expectedRevision,
        status: "active",
        autoCommit: null,
        expiresAt: { $gt: now },
      },
      { $set: { autoCommit: { ...claim, claimedAt: now }, updatedAt: now } },
    );
    return result.modifiedCount === 1;
  }

  /**
   * Known payment rejection releases the claim without changing gameplay.
   * @param {string} battleId
   * @param {string} claimId
   */
  async releaseAuto(battleId, claimId) {
    const result = await this.collection.updateOne(
      { _id: battleId, status: "active", "autoCommit.claimId": claimId },
      { $set: { autoCommit: null, updatedAt: this.now() } },
    );
    if (result.modifiedCount !== 1) throw new Error("Lost Auto payment claim");
  }

  /**
   * Ambiguous payment/write failure: keep the claim for manual reconciliation.
   * @param {string} battleId
   * @param {string} claimId
   * @param {*} error
   */
  async failAuto(battleId, claimId, error) {
    await this.collection.updateOne(
      { _id: battleId, status: "active", "autoCommit.claimId": claimId },
      { $set: { "autoCommit.error": String(error), updatedAt: this.now() } },
    );
  }

  /**
   * Commit the complete replay batch under the same claim that authorized payment.
   * @param {string} battleId
   * @param {number} expectedRevision
   * @param {object} claim
   * @param {object} simulation
   */
  async finishAuto(battleId, expectedRevision, claim, simulation) {
    const now = this.now();
    const actions = simulation.actions.map((entry, index) => ({
      ...entry,
      revision: expectedRevision + index + 1,
      requestId: `auto:${claim.requestId}:${index}`,
    }));
    const result = await this.collection.updateOne(
      {
        _id: battleId,
        status: "active",
        revision: expectedRevision,
        "autoCommit.claimId": claim.claimId,
      },
      {
        $set: {
          revision: expectedRevision + actions.length,
          status: "completed",
          view: simulation.view,
          needsAutomaticTurn: false,
          updatedAt: now,
          completedAt: now,
          expiresAt: null,
          resultExpiresAt: null,
          completionStatus: "pending",
          autoCommit: null,
          autoResult: {
            requestId: claim.requestId,
            userId: claim.userId,
            cost: claim.cost,
            baseRevision: expectedRevision,
          },
        },
        $push: { actions: { $each: actions } },
      },
    );
    if (result.modifiedCount !== 1)
      throw new Error("Lost Auto finalization claim after payment");
  }

  /**
   * Claim completion once. An interrupted claim requires manual reconciliation.
   * @param {string} battleId
   * @param {string} claimId
   */
  async claimCompletion(battleId, claimId) {
    const result = await this.collection.updateOne(
      { _id: battleId, status: "completed", completionStatus: "pending" },
      {
        $set: {
          completionStatus: "processing",
          completionClaimId: claimId,
          completionClaimedAt: this.now(),
          resultExpiresAt: null,
        },
      },
    );
    return result.modifiedCount === 1;
  }

  async finishCompletion(
    battleId,
    claimId,
    { summary = null, error = null } = {},
  ) {
    const record = await this.get(battleId);
    const now = this.now();
    const result = await this.collection.updateOne(
      {
        _id: battleId,
        status: "completed",
        completionStatus: "processing",
        completionClaimId: claimId,
      },
      {
        $set: {
          completionStatus: error ? "failed" : "applied",
          completionSummary: summary,
          completionError: error,
          completionFinishedAt: now,
          resultExpiresAt: error
            ? null
            : new Date(now.getTime() + record.resultRetentionMs),
        },
      },
    );
    if (result.modifiedCount !== 1) {
      throw new Error(`Lost completion claim for battle ${battleId}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  rejected(reason, record) {
    return {
      accepted: false,
      reason,
      revision: record.revision,
      view: record.view,
    };
  }
}

module.exports = { BattleStore };
