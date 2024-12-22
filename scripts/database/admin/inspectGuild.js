/* eslint-disable no-console */
require("dotenv").config();
const { QueryBuilder } = require("../../../src/database/mongoHandler");
const { collectionNames } = require("../../../src/config/databaseConfig");

const guildId = process.argv[2];

// get the specified guild

const getGuild = async () => {
  const res = await new QueryBuilder(collectionNames.GUILDS)
    .setFilter({
      guildId,
    })
    .findOne();
  return res;
};

getGuild()
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
