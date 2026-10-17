const {
  createMongoBattleStore,
} = require("../battle/persistence/mongoBattleStore");
const { BattleService } = require("../battle/service/BattleService");
const {
  getAutoBattleEligibility,
  chargeAutoBattle,
  recordAutoBattleUsage,
} = require("./battleAuto");

let servicePromise = null;

const isDurableBattleEnabled = () =>
  process.env.DURABLE_BATTLES_ENABLED === "true";
const isDurableRaidEnabled = () =>
  isDurableBattleEnabled() && process.env.DURABLE_RAIDS_ENABLED === "true";

const getDurableBattleService = () => {
  if (!servicePromise) {
    servicePromise = createMongoBattleStore()
      .then(
        (store) =>
          new BattleService(store, {
            autoEligibility: getAutoBattleEligibility,
            autoCharge: chargeAutoBattle,
            onCompleted: async (battle, record) => {
              // Resolve after battle.js has loaded; it also starts durable battles.
              // eslint-disable-next-line global-require
              const { processDurableBattleCompletion } = require("./battle");
              if (record.autoResult) {
                await recordAutoBattleUsage({
                  ...record.autoResult,
                  npcId: battle.npcId,
                });
              }
              let modeSummary = "";
              if (record.mode.type === "raid") {
                // eslint-disable-next-line global-require
                const { applyDurableRaidCompletion } = require("./raid");
                modeSummary = await applyDurableRaidCompletion(
                  battle,
                  record.mode,
                );
              }
              const rewardSummary = await processDurableBattleCompletion(
                battle,
                record,
              );
              return [modeSummary, rewardSummary].filter(Boolean).join("\n");
            },
          }),
      )
      .catch((error) => {
        servicePromise = null;
        throw error;
      });
  }
  return servicePromise;
};

module.exports = {
  getDurableBattleService,
  isDurableBattleEnabled,
  isDurableRaidEnabled,
};
