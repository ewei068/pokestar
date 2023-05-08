const { buildUrlButton } = require("../../components/urlButton");

const TUTORIAL_URL = "https://github.com/ewei068/pokestar/blob/main/README.md#tutorial";

const tutorial = async () => {
    const button = buildUrlButton("Tutorial", TUTORIAL_URL);
    const send = {
        content: "View the beginner tutorial here!",
        components: [button]
    }

    return { send: send, err: null };
}

const tutorialMessageCommand = async (message) => {
    const { send, err } = await tutorial();
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const tutorialSlashCommand = async (interaction) => {
    const { send, err } = await tutorial();
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: tutorialMessageCommand,
    slash: tutorialSlashCommand
};