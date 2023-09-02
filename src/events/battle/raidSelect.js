const { buildRaidSend } = require("../../services/raid");
const { getState } = require("../../services/state");

const raidSelect = async (interaction, data) => {
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

    const raidId = interaction.values[0];
    state.raidId = raidId;
    state.view = "raid"

    const { send, err } = await buildRaidSend({
        stateId: data.stateId,
        user: interaction.user,
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = raidSelect;