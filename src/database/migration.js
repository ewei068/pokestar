const { DB_NAME, collectionConfig } = require("../config/databaseConfig");
const { MongoClient } = require("mongodb");

const baseURL = process.env.MONGODB_URL;

const client = new MongoClient(`${baseURL}/${DB_NAME}`, { useUnifiedTopology: true, connectTimeoutMS: 5000});

const createIndices = (dbo, collectionName, collection) => {
    return new Promise((resolve, reject) => {
        for (const index of collection.indexes) {
            // check if index exists
            dbo.collection(collectionName).indexExists(index.key).then((exists) => {
                if (exists) {
                    console.log(`Index already exists for ${collectionName}!`);
                    return;
                }
                dbo.collection(collectionName).createIndex(index.key, { unique: index.unique }).then(() => {
                    console.log(`Index created for ${collectionName}!`);
                }).catch(err => {
                    console.log(err)
                });
            }).catch(err => {
                console.log(err)
            });
        }
        resolve();
    });
}

client.connect().then(() => {
    console.log("Database connected!")

    const dbo = client.db(DB_NAME);

    for (const collectionName in collectionConfig) {
        // check if collection exists
        dbo.listCollections({ name: collectionName }).toArray().then((collections) => {
            // TODO: index removal?

            if (collections.length > 0) {
                console.log(`Collection ${collectionName} already exists!`);
                createIndices(dbo, collectionName, collectionConfig[collectionName]);
                return;
            }
            const collection = collectionConfig[collectionName];
            dbo.createCollection(collectionName).then(() => {
                console.log(`Collection ${collectionName} created!`);
                createIndices(dbo, collectionName, collection);
            }).catch(err => {
                console.log(err)
            });
        }).catch(err => {
            console.log(err)
        });
    }
}).catch(err => {
    console.log(err)
})