const ping = (client, message) => {
    message.channel.send("pong!");
}

module.exports = ping;