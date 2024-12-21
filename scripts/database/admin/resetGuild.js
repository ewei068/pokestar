/* eslint-disable no-console */
require("dotenv").config();
const { deleteDocuments } = require("../../../src/database/mongoHandler");
const { collectionNames } = require("../../../src/config/databaseConfig");

const guildId = process.argv[2];

// reset the specified guild

const resetGuild = async () => {
  const res = await deleteDocuments(collectionNames.GUILDS, {
    guildId,
  });
  return res;
};

resetGuild()
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
