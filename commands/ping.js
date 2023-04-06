const ping = (client, message) => {
    message.channel.send("pong!");
}

module.exports = {
	command: "ping",
    description: "Ping!",
    execute: ping
};