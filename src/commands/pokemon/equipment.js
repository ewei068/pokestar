const { modifierSlots } = require("../../config/equipmentConfig");
const { buildEquipmentSend, getIdFromNameOrId } = require("../../services/pokemon");
const { setState, deleteState } = require("../../services/state");

const equipment = async (user, pokemonId) => {
    // build selection list of shop categories
    const stateId = setState({
        userId: user.id,
        pokemonId: pokemonId,
        slotId: modifierSlots.PRIMARY,
        messageStack: []
    }, ttl=150);

    const { send, err } = await buildEquipmentSend({
        stateId: stateId,
        user: user,
    });
    if (err) {
        deleteState(stateId);
    }

    return { send: send, err: err };
}

const equipmentMessageCommand = async (message) => {
    const args = message.content.split(" ");
    const pokemonId = args[1];
    const { send, err } = await equipment(message.author, pokemonId);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    }
    else {
        await message.channel.send(send);
    }
}

const equipmentSlashCommand = async (interaction) => {
    const nameOrId = interaction.options.getString('name_or_id');
    const idRes = await getIdFromNameOrId(interaction.user, nameOrId, interaction);
    if (idRes.err) {
        await interaction.editReply(`${idRes.err}`);
        return { err: idRes.err };
    }
    const pokemonId = idRes.data;
    const { send, err } = await equipment(interaction.user, pokemonId);
    if (err) {
        await interaction.editReply(`${err}`);
        return { err: err };
    }
    else {
        await interaction.editReply(send);
    }
}

module.exports = {
    message: equipmentMessageCommand,
    slash: equipmentSlashCommand
};
