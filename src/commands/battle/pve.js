const { setState, deleteState } = require("../../services/state");
const { buildPveSend } = require("../../services/battle");

const pve = async (user, npcId, difficulty) => {
    // if no npc, build list
    if (!npcId) {
        const stateId = setState({
            userId: user.id,
        }, ttl=300);
        const { send, err } = await buildPveSend({
            stateId: stateId,
            user: user,
            view: "list",
            option: null,
            page: 1,
        });
        if (err) {
            deleteState(stateId);
        }
        return { send: send, err: err };
    } else if (!difficulty) {
        // if no difficulty, build npc data
        const stateId = setState({
            userId: user.id,
        }, ttl=300);
        const { send, err } = await buildPveSend({
            stateId: stateId,
            user: user,
            view: "npc",
            option: npcId,
            page: 1,
        });
        if (err) {
            deleteState(stateId);
        }
        return { send: send, err: err };
    } else {
        const stateId = setState({
            userId: user.id,
            npcId: npcId,
            difficulty: difficulty,
        }, ttl=300);
        const { send, err } = await buildPveSend({
            stateId: stateId,
            user: user,
            view: "battle"
        });
        if (err) {
            deleteState(stateId);
        }
        return { send: send, err: err };
    }
}

const pveMessageCommand = async (message) => {
    const args = message.content.split(' ');
    const npcId = args[1];
    const difficulty = args[2];
    const { send, err } = await pve(message.author, npcId, difficulty);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.channel.send(send);
    }
}

const pveSlashCommand = async (interaction) => {
    const npcId = interaction.options.getString('npcid');
    const difficulty = interaction.options.getString('difficulty');
    const { send, err } = await pve(interaction.user, npcId, difficulty);
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = {
    message: pveMessageCommand,
    slash: pveSlashCommand
};
