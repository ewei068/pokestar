const {
  createMongoBattleStore,
} = require("../battle/persistence/mongoBattleStore");
const { BattleService } = require("../battle/service/BattleService");

let servicePromise = null;

const isDurableBattleEnabled = () => process.env.DURABLE_BATTLES_ENABLED === "true";

const getDurableBattleService = () => {
  if (!servicePromise) {
    servicePromise = createMongoBattleStore()
      .then((store) => new BattleService(store, {
        onCompleted: (battle) => {
          // Resolve after battle.js has loaded; it also starts durable battles.
          // eslint-disable-next-line global-require
          const { processBattleCompletionRewards } = require("./battle");
          return processBattleCompletionRewards(battle, { strict: true });
        },
      }))
      .catch((error) => {
        servicePromise = null;
        throw error;
      });
  }
  return servicePromise;
};

module.exports = { getDurableBattleService, isDurableBattleEnabled };
