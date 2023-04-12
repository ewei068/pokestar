const echoMessageCommand = async (message) => {
    const args = message.content.split(" ");
    args.shift();
    await message.channel.send(args.join(" "));
}

const echoSlashCommand = async (interaction) => {
    const args = interaction.options._hoistedOptions;
    await interaction.reply(args[0].value);
}

module.exports = {
    message: echoMessageCommand,
    slash: echoSlashCommand
}