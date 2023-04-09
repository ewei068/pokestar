const { collectionNames } = require("../../config/databaseConfig");
const { insertDocument } = require("../../database/mongoHandler");

const echo = async (client, message) => {
    const args = message.content.split(" ");
    args.shift();
    message.channel.send(args.join(" "));
}

module.exports = echo;