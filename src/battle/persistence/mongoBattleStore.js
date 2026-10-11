const { getCollection } = require("../../database/mongoHandler");
const { collectionNames } = require("../../config/databaseConfig");
const { BattleStore } = require("./BattleStore");

const createMongoBattleStore = async () =>
  new BattleStore(await getCollection(collectionNames.BATTLES));

module.exports = { createMongoBattleStore };
