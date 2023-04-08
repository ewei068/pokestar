const { MongoClient } = require("mongodb");
const { DB_NAME, collectionNames } = require("../config/databaseConfig");

const baseURL = process.env.MONGODB_URL;

const client = new MongoClient(`${baseURL}/${DB_NAME}`, { useUnifiedTopology: true, connectTimeoutMS: 5000});

const connectToClient = async () => {
    await client.connect();
    return client;
}

const getCollection = async (collectionName) => {
    const client = await connectToClient();
    const dbo = client.db(DB_NAME);
    return dbo.collection(collectionName);
}

const insertDocument = async (collectionName, document) => {
    const collection = await getCollection(collectionName);
    const rv = await collection.insertOne(document);
    return rv;
}

const updateDocument = async (collectionName, filter, update) => {
    const collection = await getCollection(collectionName);
    const rv = await collection.updateOne(filter, update);
    return rv;
}

const findDocuments = async (collectionName, filter) => {
    const collection = await getCollection(collectionName);
    const rv = await collection.find(filter).toArray();
    return rv
}

module.exports = {
    insertDocument,
    updateDocument,
    findDocuments,
};
