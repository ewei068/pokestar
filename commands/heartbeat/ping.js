const { collectionNames } = require("../../config/databaseConfig");
const { findDocuments } = require("../../database/mongoHandler");

const ping = async (client, message) => {
    message.channel.send("pong!");

    const res = await findDocuments(collectionNames.USERS, {});
    for (const doc of res) {
        message.channel.send(doc.message);
    }
}

module.exports = ping;