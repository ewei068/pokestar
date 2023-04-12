const { MongoClient, ObjectId} = require("mongodb");
const { DB_NAME, collectionNames } = require("../config/databaseConfig");
const { logger } = require("../log");

const baseURL = process.env.MONGODB_URL;

const client = new MongoClient(`${baseURL}/${DB_NAME}`, { useUnifiedTopology: true, connectTimeoutMS: 5000});

client.connect().then(() => {
    logger.info(`Connected to database ${DB_NAME}!`);
});

const getCollection = async (collectionName) => {
    const dbo = client.db(DB_NAME);
    return dbo.collection(collectionName);
}

const insertDocument = async (collectionName, document) => {
    const collection = await getCollection(collectionName);
    const res = await collection.insertOne(document);
    return res;
}

const updateDocument = async (collectionName, filter, update) => {
    const collection = await getCollection(collectionName);
    const res = await collection.updateOne(filter, update);
    return res;
}

const findDocuments = async (collectionName, filter, limit=100, page=0) => {
    const collection = await getCollection(collectionName);
    // retrieves one extra item to check for end of items
    const res = await collection.find(filter).limit(limit + 1).skip(page * limit).toArray();
    return res
}

const deleteDocuments = async (collectionName, filter) => {
    const collection = await getCollection(collectionName);
    const res = await collection.deleteMany(filter);
    return res;
}

const countDocuments = async (collectionName, filter) => {
    const collection = await getCollection(collectionName);
    const res = collection.countDocuments(filter);
    return res;
}

const idFrom = (str) => {
    return new ObjectId(str);
}

module.exports = {
    insertDocument,
    updateDocument,
    findDocuments,
    countDocuments,
    deleteDocuments,
    idFrom
};
