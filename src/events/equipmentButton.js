/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * equipmentButton.js gets the user's selection within the equipment menu and loads the relevant information.
*/
const { getState } = require("../services/state");
const { buildEquipmentUpgradeSend, buildEquipmentSend } = require("../services/pokemon");
const { equipmentInfoString, equipmentInfoString2 } = require("../config/equipmentConfig");

const equipmentButton = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        await interaction.update({ 
            components: [] 
        });
        return { err: "This interaction has expired." };
    }

    // if data has userId component, verify interaction was done by that user
    if (state.userId && interaction.user.id !== state.userId) {
        return { err: "This interaction was not initiated by you." };
    }

    // get which button was used
    const button = data.button;
    if (!button) {
        return { err: "No button was selected." };
    }

    let fn = null;
    if (button === "upgrade") {
        state.button = button;
        fn = buildEquipmentUpgradeSend;
    } else if (button === "slot") {
        state.button = button;
        fn = buildEquipmentUpgradeSend;
    } else if (button === "back") {
        state.button = null;
        fn = buildEquipmentSend;
    } else if (button === "info" ) {
        await interaction.reply({
            content: equipmentInfoString,
            ephemeral: true
        });
        await interaction.followUp({
            content: equipmentInfoString2,
            ephemeral: true
        });
        return;
    } else {
        return { err: "Invalid button." };
    }     

    const { send, err } = await fn({
        stateId: data.stateId,
        user: interaction.user,
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = equipmentButton;