/* eslint-disable no-console */
require("dotenv").config();
const { updateDocuments } = require("../../../src/database/mongoHandler");
const { collectionNames } = require("../../../src/config/databaseConfig");

const tutorialUserId = "638163104236175427";
const userId = process.argv[2] || tutorialUserId;

// reset the specified player's dailys

const resetPlayerDaily = async () => {
  const res = await updateDocuments(
    collectionNames.USERS,
    {
      userId,
    },
    {
      $set: {
        lastCorrected: 0,
      },
    }
  );
  return res;
};

resetPlayerDaily()
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
