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

/**
 * Mongo-backed durable battle actions. The collection must have a unique _id.
 */
class BattleStore {
  constructor(collection, { now = () => new Date() } = {}) {
    this.collection = collection;
    this.now = now;
  }

  /** @param {{ battle: Battle, mode?: object, expiresAt?: Date }} options */
  async create({ battle, mode = {}, expiresAt = null }) {
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
      createdAt: now,
      updatedAt: now,
      expiresAt,
    };
    await this.collection.insertOne(record);
    return record;
  }

  async get(battleId) {
    return this.collection.findOne({ _id: battleId });
  }

  async listActive(userId) {
    const records = await this.collection
      .find({ participantIds: userId, status: "active" })
      .toArray();
    return records.filter(
      (record) => !record.expiresAt || record.expiresAt > this.now(),
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
      return this.rejected("battle_inactive", record);
    }
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
    const update = {
      revision: nextRevision,
      requestId,
      actorUserId,
      action: { ...action },
      events: outcome.events,
      log: outcome.log,
      view: outcome.snapshot,
    };
    const result = await this.collection.updateOne(
      { _id: battleId, revision: record.revision, status: "active" },
      {
        $set: {
          revision: nextRevision,
          status: battle.ended ? "completed" : "active",
          view: outcome.snapshot,
          updatedAt: this.now(),
        },
        $push: { actions: update },
      },
    );
    if (result.modifiedCount !== 1) {
      const latest = await this.get(battleId);
      const committed = latest.actions.find((entry) => entry.requestId === requestId);
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
      return this.rejected("stale_revision", latest);
    }
    return {
      accepted: true,
      duplicate: false,
      update,
      revision: nextRevision,
      view: outcome.snapshot,
    };
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
