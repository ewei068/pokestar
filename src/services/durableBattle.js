const {
  createMongoBattleStore,
} = require("../battle/persistence/mongoBattleStore");
const { BattleService } = require("../battle/service/BattleService");

let servicePromise = null;

const getDurableBattleService = () => {
  if (!servicePromise) {
    servicePromise = createMongoBattleStore()
      .then((store) => new BattleService(store))
      .catch((error) => {
        servicePromise = null;
        throw error;
      });
  }
  return servicePromise;
};

module.exports = { getDurableBattleService };
