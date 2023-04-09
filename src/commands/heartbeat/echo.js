const echoMessageCommand = async (client, message) => {
    const args = message.content.split(" ");
    args.shift();
    message.channel.send(args.join(" "));
}

const echoSlashCommand = async (interaction) => {
    const args = interaction.options._hoistedOptions;
    interaction.reply(args[0].value);
}

module.exports = {
    message: echoMessageCommand,
    slash: echoSlashCommand
}