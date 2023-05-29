const { setState, deleteState } = require("../../services/state");
const { buildPveSend, buildDungeonSend } = require("../../services/battle");

const dungeons = async (user) => {
    const stateId = setState({
        userId: user.id,
    }, ttl=300);
    const { send, err } = await buildDungeonSend({
        stateId: stateId,
        user: user,
        view: "list"
    });
    if (err) {
        deleteState(stateId);
    }
    return { send: send, err: err };
}

const dungeonsMessageCommand = async (message) => {
    const { send, err } = await dungeons(message.author);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const dungeonsSlashCommand = async (interaction) => {
    const { send, err } = await dungeons(interaction.user);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: dungeonsMessageCommand,
    slash: dungeonsSlashCommand
};
