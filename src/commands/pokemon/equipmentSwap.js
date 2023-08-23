/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * equipmentSwap.js is used to swap the equipment on a given pokemon
*/
const { modifierSlots } = require("../../config/equipmentConfig");
const { buildEquipmentSwapSend, getIdFromNameOrId } = require("../../services/pokemon");
const { setState, deleteState } = require("../../services/state");

/**
 * Used to swap the equipment on a given pokemon
 * @param {*} user the user we're getting the data from.
 * @param {*} pokemonId the Id of the user's pokemon we're looking at.
 * @returns 
 */
const equipmentSwap = async (user, pokemonId, pokemonId2, equipmentType) => {
    const stateId = setState({
        userId: user.id,
        pokemonId: pokemonId,
        pokemonId2: pokemonId2,
        equipmentType: equipmentType,
    }, ttl=150);

    const { send, err } = await buildEquipmentSwapSend({
        stateId: stateId,
        user: user,
    });
    if (err) {
        deleteState(stateId);
    }

    return { send: send, err: err };
}

const equipmentSwapMessageCommand = async (message) => {
    const args = message.content.split(" ");
    const pokemonId = args[1];
    const pokemonId2 = args[2];
    const equipmentType = args[3];
    const { send, err } = await equipmentSwap(message.author, pokemonId, pokemonId2, equipmentType);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    }
    else {
        await message.channel.send(send);
    }
}

const equipmentSwapSlashCommand = async (interaction) => {
    const nameOrId = interaction.options.getString('name_or_id');
    const idRes = await getIdFromNameOrId(interaction.user, nameOrId, interaction);
    if (idRes.err) {
        await interaction.editReply(`${idRes.err}`);
        return { err: idRes.err };
    }
    const pokemonId = idRes.data;
    const nameOrId2 = interaction.options.getString('name_or_id2');
    const idRes2 = await getIdFromNameOrId(interaction.user, nameOrId2, interaction, false);
    if (idRes2.err) {
        await interaction.editReply(`${idRes2.err}`);
        return { err: idRes2.err };
    }
    const pokemonId2 = idRes2.data;
    const equipmentType = interaction.options.getString('equipment_type');
    const { send, err } = await equipmentSwap(interaction.user, pokemonId, pokemonId2, equipmentType);
    if (err) {
        await interaction.editReply(`${err}`);
        return { err: err };
    }
    else {
        await interaction.editReply(send);
    }
}

module.exports = {
    message: equipmentSwapMessageCommand,
    slash: equipmentSwapSlashCommand
};
