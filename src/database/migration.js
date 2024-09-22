/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * migration.js Only run once. Migrates all of the necessary components for new use.
 */
require("dotenv").config();
const { MongoClient } = require("mongodb");
const { DB_NAME, collectionConfig } = require("../config/databaseConfig");
const { logger } = require("../log");

const baseURL = process.env.MONGODB_URL;

const client = new MongoClient(`${baseURL}/${DB_NAME}`, {
  useUnifiedTopology: true,
  connectTimeoutMS: 5000,
});

const createIndices = async (dbo, collectionName, collection) => {
  if (!collection.indexes) {
    return;
  }
  for (const index of collection.indexes) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await dbo
        .collection(collectionName)
        .createIndex(index.key, { unique: index.unique });
      logger.info(`Index created for collection ${collectionName}`);
    } catch (error) {
      logger.error(`Error creating index for collection ${collectionName}`);
      logger.error(error);
    }
  }
};

const createCollection = async (dbo, name, collectionData) => {
  // check if collection exists
  const collectionList = await dbo.listCollections({ name }).toArray();
  if (collectionList.length > 0) {
    if (!collectionData.viewOn) {
      logger.info(`Collection ${name} already exists!`);
      return;
    }
    // drop view
    await dbo.dropCollection(name);
    logger.info(`View ${name} dropped!`);
  }

  // create collection
  if (collectionData.viewOn) {
    await dbo.createCollection(name, {
      viewOn: collectionData.viewOn,
      pipeline: collectionData.pipeline,
    });
    logger.info(`View ${name} created!`);
  } else {
    await dbo.createCollection(name);
    logger.info(`Collection ${name} created!`);
  }
};

client
  .connect()
  .then(async () => {
    logger.info("Database connected!");

    const dbo = await client.db(DB_NAME);

    for (const collectionName in collectionConfig) {
      const collectionData = collectionConfig[collectionName];
      try {
        // eslint-disable-next-line no-await-in-loop
        await createCollection(dbo, collectionName, collectionData);
      } catch (error) {
        logger.error(`Error creating collection ${collectionName}`);
        logger.error(error);
        continue;
      }
      // const collection = await dbo.collection(collectionName);
      // eslint-disable-next-line no-await-in-loop
      await createIndices(dbo, collectionName, collectionData);
    }
  })
  .catch((err) => {
    logger.info(err);
  });
