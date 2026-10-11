const { projectBattleRecord } = require("./battleWebView");

/** Browser-facing adapter: only its projected responses may be sent over HTTP. */
class BattleWebService {
  constructor(battleService) {
    this.battleService = battleService;
  }

  async listActive(userId) {
    const records = await this.battleService.store.listActive(userId);
    return records.map((record) => ({
      battleId: record._id,
      revision: record.revision,
      mode: { type: record.mode.type },
      turn: record.view.turn,
      updatedAt: record.updatedAt,
      expiresAt: record.expiresAt,
    }));
  }

  async get({ battleId, userId, sinceRevision = null }) {
    const access = await this.battleService.get({ battleId, userId });
    if (!access.found) return { found: false };

    // Read after the authorized service call, which can settle completion.
    // Project one coherent record if another participant acted meanwhile.
    const record = await this.battleService.store.get(battleId);
    if (!record || !record.participantIds.includes(userId) ||
        (record.resultExpiresAt && record.resultExpiresAt <= this.battleService.store.now())) {
      return { found: false };
    }
    return projectBattleRecord(record, userId, sinceRevision);
  }

  async act({ battleId, userId, expectedRevision, requestId, action }) {
    const outcome = await this.battleService.act({
      battleId,
      userId,
      expectedRevision,
      requestId,
      action,
    });
    if (outcome.reason === "battle_not_found") return outcome;
    const latest = await this.get({ battleId, userId, sinceRevision: expectedRevision });
    if (!latest.found) return { accepted: false, reason: "battle_not_found" };
    return {
      ...latest,
      accepted: outcome.accepted,
      ...(outcome.duplicate !== undefined ? { duplicate: outcome.duplicate } : {}),
      ...(outcome.reason ? { reason: outcome.reason } : {}),
    };
  }
}

module.exports = { BattleWebService };
