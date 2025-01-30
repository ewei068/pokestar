/* eslint-disable no-console */
require("dotenv").config();
const { deleteDocuments } = require("../../../src/database/mongoHandler");
const { collectionNames } = require("../../../src/config/databaseConfig");

const clearRaids = async () => {
  const res = deleteDocuments(collectionNames.RAIDS, {});
  return res;
};

clearRaids()
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });
