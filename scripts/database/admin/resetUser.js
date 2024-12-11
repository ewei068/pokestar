/* eslint-disable no-console */
require("dotenv").config();
const { deleteDocuments } = require("../../../src/database/mongoHandler");
const { collectionNames } = require("../../../src/config/databaseConfig");

const tutorialUserId = "638163104236175427";
const userId = process.argv[2] || tutorialUserId;

// reset the specified player

const resetPlayer = async () => {
  const res = await deleteDocuments(collectionNames.USERS, {
    userId,
  });
  return res;
};

const resetPokemon = async () => {
  const res = await deleteDocuments(collectionNames.USER_POKEMON, {
    userId,
  });
  return res;
};

resetPlayer()
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });

resetPokemon()
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
