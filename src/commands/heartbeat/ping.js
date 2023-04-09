const pingMessageCommand = async (client, message) => {
    message.channel.send("pong!");
}

const pingSlashCommand = async (interaction) => {
    interaction.reply("pong!");
}

module.exports = {
    message: pingMessageCommand,
    slash: pingSlashCommand
};