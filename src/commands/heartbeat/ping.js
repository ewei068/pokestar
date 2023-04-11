const pingMessageCommand = async (client, message) => {
    await message.channel.send("pong!");
}

const pingSlashCommand = async (interaction) => {
    await interaction.reply("pong!");
}

module.exports = {
    message: pingMessageCommand,
    slash: pingSlashCommand
};