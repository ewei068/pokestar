/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * equipmentSelect.js builds the menu for the selected equipment.
*/
const { getState, setState } = require("../../services/state");
const { buildEquipmentUpgradeSend } = require("../../services/pokemon");
const { modifierSlots } = require("../../config/equipmentConfig");

const equipmentSelect = async (interaction, data) => {
    // get state to refresh it if possible
    getState(data.stateId);

    // get which option was selected
    const option = interaction.values[0];
    if (!option) {
        return { err: "No option was selected." };
    }

    // attempt to get pokemon id and equipment type
    const optionJson = JSON.parse(option);
    const pokemonId = optionJson.pokemonId;
    const equipmentType = optionJson.equipmentType;

    // create state
    const stateId = setState({
        userId: interaction.user.id,
        pokemonId: pokemonId,
        slotId: modifierSlots.PRIMARY,
        equipmentType: equipmentType,
        messageStack: []
    });

    const { send, err } = await buildEquipmentUpgradeSend({
        stateId: stateId,
        user: interaction.user,
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.reply(send);
    }
}

module.exports = equipmentSelect;