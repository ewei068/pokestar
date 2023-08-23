/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * equipmentList.js list and sort the equipment
*/
const { modifierSlots } = require("../../config/equipmentConfig");
const { buildEquipmentListSend, getIdFromNameOrId } = require("../../services/pokemon");
const { setState, deleteState } = require("../../services/state");

/**
 * Used to list the equipment 
 * @returns 
 */
const equipmentList = async (user, equipmentType, sortStat, includeLevel, page) => {
    // build selection list of equipment
    const stateId = setState({
        userId: user.id,
        equipmentType: equipmentType,
        stat: sortStat,
        includeLevel: includeLevel,
        page: page,
    }, ttl=150);

    const { send, err } = await buildEquipmentListSend({
        stateId: stateId,
        user: user,
    });
    if (err) {
        deleteState(stateId);
    }

    return { send: send, err: err };
}

const equipmentListMessageCommand = async (message) => {
    const args = message.content.split(" ");
    const equipmentType = args[1];
    const sortStat = args[2];
    const includeLevel = args[3] ? args[3].toLowerCase() === 'true' : true;
    const page = args[4] ? parseInt(args[4]) : 1;
    const { send, err } = await equipmentList(message.author, equipmentType, sortStat, includeLevel, page);
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    }
    else {
        await message.channel.send(send);
    }
}

const equipmentListSlashCommand = async (interaction) => {
    await interaction.deferReply();
    const equipmentType = interaction.options.getString('equipment_type');
    const sortStat = interaction.options.getString('sort_stat');
    const includeLevel = interaction.options.getBoolean('include_level') === false ? false : true;
    const page = interaction.options.getInteger('page');
    const { send, err } = await equipmentList(interaction.user, equipmentType, sortStat, includeLevel, page);
    if (err) {
        await interaction.editReply(`${err}`);
        return { err: err };
    } else {
        await interaction.editReply(send);
    }
}

module.exports = {
    message: equipmentListMessageCommand,
    slash: equipmentListSlashCommand
};
