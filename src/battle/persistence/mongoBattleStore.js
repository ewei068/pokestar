const { getCollection } = require("../../database/mongoHandler");
const { collectionNames } = require("../../config/databaseConfig");
const { BattleStore } = require("./BattleStore");

const createMongoBattleStore = async () => {
  const collection = await getCollection(collectionNames.BATTLES);
  await Promise.all([
    collection.createIndex({ participantIds: 1, status: 1 }),
    collection.createIndex(
      { resultExpiresAt: 1 },
      { expireAfterSeconds: 0 },
    ),
  ]);
  return new BattleStore(collection);
};

module.exports = { createMongoBattleStore };
