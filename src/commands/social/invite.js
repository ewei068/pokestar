const { buildUrlButton } = require("../../components/urlButton");

const INVITE_URL = "https://discord.com/oauth2/authorize?client_id=1093411444877439066&permissions=18136036801601&scope=applications.commands%20bot";

const invite = async () => {
    const button = buildUrlButton("Invite", INVITE_URL);
    const send = {
        content: "Invite me to your server!",
        components: [button]
    }

    return { send: send, err: null };
}

const inviteMessageCommand = async (message) => {
    const { send, err } = await invite();
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const inviteSlashCommand = async (interaction) => {
    const { send, err } = await invite();
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: inviteMessageCommand,
    slash: inviteSlashCommand
};