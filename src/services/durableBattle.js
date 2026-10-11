const {
  createMongoBattleStore,
} = require("../battle/persistence/mongoBattleStore");
const { BattleService } = require("../battle/service/BattleService");
const { processBattleCompletionRewards } = require("./battle");

let servicePromise = null;

const getDurableBattleService = () => {
  if (!servicePromise) {
    servicePromise = createMongoBattleStore()
      .then((store) => new BattleService(store, {
        onCompleted: (battle) => processBattleCompletionRewards(battle, { strict: true }),
      }))
      .catch((error) => {
        servicePromise = null;
        throw error;
      });
  }
  return servicePromise;
};

module.exports = { getDurableBattleService };
