const { findAndUpdateDocument } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { getTrainerFromId, emitTrainerEvent } = require("./trainer");
const { trainerEventEnum } = require("../enums/gameEnums");

// Account eligibility is live data, separate from the replayable battle setup.
const getAutoBattleEligibility = async ({ userId, cost }) => {
  const { data: trainer, err } = await getTrainerFromId(userId);
  if (err || !trainer)
    return { visible: false, enabled: false, reason: "trainer_unavailable" };
  if (!trainer.hasDarkrai)
    return { visible: false, enabled: false, reason: "auto_not_unlocked" };
  return {
    visible: true,
    enabled: trainer.dreamCards >= cost,
    reason: trainer.dreamCards >= cost ? null : "insufficient_dream_cards",
  };
};

/**
 * Called only while the battle's exclusive finalization claim is held.
 * @param {{userId: string, cost: number}} options
 */
const chargeAutoBattle = async ({ userId, cost }) => {
  // Conditional increment preserves concurrent balance changes; never write a stale trainer.
  // Explicit options prevent mongoHandler's default upsert on a failed balance check.
  const result = await findAndUpdateDocument(
    collectionNames.USERS,
    { userId, hasDarkrai: true, dreamCards: { $gte: cost } },
    { $inc: { dreamCards: -cost } },
    { upsert: false, returnDocument: "after" },
  );
  return {
    paid: Boolean(result.value),
    reason: result.value ? null : "auto_payment_failed",
  };
};

// Called under the once-only completion claim, after the result is saved.
const recordAutoBattleUsage = async ({ userId, cost, npcId }) => {
  const trainer = await getTrainerFromId(userId);
  if (trainer.err || !trainer.data)
    throw new Error("Auto trainer unavailable after payment");
  const event = await emitTrainerEvent(trainerEventEnum.STARTED_AUTO_BATTLE, {
    trainer: trainer.data,
    dreamCards: cost,
    npcId,
  });
  if (event?.err) throw new Error(event.err);
};

module.exports = {
  getAutoBattleEligibility,
  chargeAutoBattle,
  recordAutoBattleUsage,
};
