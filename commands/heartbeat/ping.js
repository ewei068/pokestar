const { collectionNames } = require("../../config/databaseConfig");
const { findDocuments } = require("../../database/mongoHandler");

const ping = async (client, message) => {
    message.channel.send("pong!");
}

module.exports = ping;