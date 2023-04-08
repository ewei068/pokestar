const { collectionNames } = require("../../config/databaseConfig");
const { insertDocument } = require("../../database/mongoHandler");

const echo = async (client, message) => {
    const args = message.content.split(" ");
    args.shift();
    message.channel.send(args.join(" "));
    
    // insert into mongo
    const document = {
        "command": "echo",
        "message": args.join(" "),
    }
    res = await insertDocument(collectionNames.USERS, document);
    console.log(res);
}

module.exports = echo;