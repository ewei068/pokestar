const echo = (client, message) => {
    const args = message.content.split(" ");
    args.shift();
    message.channel.send(args.join(" "));
}

module.exports = echo;