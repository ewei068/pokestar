/* eslint-disable no-console */
require("dotenv").config();
const { QueryBuilder } = require("../../../src/database/mongoHandler");
const { collectionNames } = require("../../../src/config/databaseConfig");

const tutorialUserId = "638163104236175427";
const userId = process.argv[2] || tutorialUserId;

// get the specified player

const getPlayer = async () => {
  const res = await new QueryBuilder(collectionNames.USERS)
    .setFilter({
      userId,
    })
    .findOne();
  return res;
};

getPlayer()
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
