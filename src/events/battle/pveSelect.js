/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * pveSelect.js After the user selects an npc, creates the pve selection menu for the user to select the difficulty of the npc displayed.
*/
const { getState } = require("../../services/state");
const { buildPveSend } = require("../../services/battle");

/**
 * creates the pve selection menu for the user to select the difficulty of the npc displayed.
 * @param {*} interaction the interaction from the user to select the npc.
 * @param {*} data the relevant data to get the state and information from the state to build the display.
 * @returns 
 */
const pveSelect = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        await interaction.update({ 
            components: [] 
        });
        return { err: "This interaction has expired." };
    }

    // verify user is the same as the user who pressed the button
    if (state.userId && interaction.user.id !== state.userId) {
        return { err: "This interaction was not initiated by you." };
    }

    const { send, err } = await buildPveSend({
        stateId: data.stateId,
        user: interaction.user,
        view: "npc",
        option: interaction.values ? interaction.values[0] : state.npcId,
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = pveSelect;