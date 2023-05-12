const { buildUrlButton } = require("../../components/urlButton");

const CHANGELOG_URL = "https://github.com/ewei068/pokestar/blob/main/changelog.md";

const changelog = async () => {
    const button = buildUrlButton("Changelog", CHANGELOG_URL);
    const send = {
        content: "Visit for a full update history!",
        components: [button]
    }

    return { send: send, err: null };
}

const changelogMessageCommand = async (message) => {
    const { send, err } = await changelog();
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const changelogSlashCommand = async (interaction) => {
    const { send, err } = await changelog();
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: changelogMessageCommand,
    slash: changelogSlashCommand
};