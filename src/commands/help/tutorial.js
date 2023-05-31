const { buildUrlButton } = require("../../components/urlButton");
const { quickstartString } = require("../../config/helpConfig");
const { buildTutorialSend } = require("../../embeds/helpEmbeds");

// depreciated for now
const TUTORIAL_URL = "https://github.com/ewei068/pokestar/blob/main/README.md#tutorial";

const tutorial = async (page) => {
    const send1 = {
        content: quickstartString,
        ephemeral: true
    }

    const { send: send2, err } = await buildTutorialSend({
        page: page,
    });
    if (err) return { send1: null, send2: null, err: err };

    return { send1: send1, send2: send2, err: null };
}

const tutorialMessageCommand = async (message) => {
    const page = message.content.split(" ")[1] ? parseInt(message.content.split(" ")[1]) : 1;
    const { send1, send2, err } = await tutorial(page);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.reply(send1);
        await message.channel.send(send2);
    }
}

const tutorialSlashCommand = async (interaction) => {
    const page = interaction.options.getInteger("page") || 1;
    const { send1, send2, err } = await tutorial(page);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send1);
        await interaction.followUp(send2);
    }
}

module.exports = {
    message: tutorialMessageCommand,
    slash: tutorialSlashCommand
};