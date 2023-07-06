/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * mongoHandler.js Handles all connections to the mongo database.
*/
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

const updateDocuments = async (collectionName, filter, update) => {
    const collection = await getCollection(collectionName);
    const res = await collection.updateMany(filter, update);
    return res;
}

/**
 * @deprecated Use query builder instead
 */
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

/**
 * @deprecated Use query builder instead
 */
const countDocuments = async (collectionName, filter) => {
    const collection = await getCollection(collectionName);
    const res = collection.countDocuments(filter);
    return res;
}

// TODO: transition to this
class QueryBuilder {
    constructor(collectionName) {
        this.collectionName = collectionName;
    }

    setFilter(filter) {
        this.filter = filter;
        return this;
    }

    setLimit(limit) {
        this.limit = limit;
        return this;
    }

    setPage(page) {
        this.page = page;
        return this;
    }

    setAggregate(aggregatePipeline) {
        this.aggregatePipeline = aggregatePipeline;
        return this;
    }

    setSort(sort) {
        this.sort = sort;
        return this;
    }

    setProjection(projection) {
        this.projection = projection;
        return this;
    }

    setUpsert(upsert) {
        this.upsert = upsert;
        return this;
    }

    setInsert(documents) {
        this.documents = documents;
        return this;
    }

    async aggregate() {
        let query = await getCollection(this.collectionName);
        query = query.aggregate(this.aggregatePipeline);
        
        return await query.toArray();
    }

    async findOne() {
        let query = await getCollection(this.collectionName);
        query = query.findOne(this.filter);

        if (this.projection) {
            query = query.project(this.projection);
        }

        return await query;
    }

    async find() {
        let query = await getCollection(this.collectionName);
        query = query.find(this.filter);

        if (this.projection) {
            query = query.project(this.projection);
        }

        if (this.sort) {
            query = query.sort(this.sort);
        }

        if (this.limit) {
            // plus 1 to see if there are more items
            query = query.limit(this.limit + 1);
        }

        if (this.page) {
            query = query.skip(this.page * this.limit);
        }

        return await query.toArray();
    }

    async countDocuments() {
        let query = await getCollection(this.collectionName);
        query = query.countDocuments(this.filter);

        return await query;
    }

    async insertMany() {
        let query = await getCollection(this.collectionName);
        query = query.insertMany(this.documents);

        return await query;
    }

    async insertOne() {
        let query = await getCollection(this.collectionName);
        query = query.insertOne(this.documents);

        return await query;
    }

    async upsertOne() {
        let query = await getCollection(this.collectionName);
        query = query.updateOne(this.filter, this.upsert, { upsert: true });

        return await query;
    }
}

module.exports = {
    insertDocument,
    updateDocument,
    updateDocuments,
    findDocuments,
    countDocuments,
    deleteDocuments,
    QueryBuilder,
};
