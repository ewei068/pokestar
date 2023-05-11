const { getState } = require("../services/state");
const { buildPveSend } = require("../services/battle");

const pveAccept = async (interaction, data) => {
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
        view: "difficulty",
        option: data.difficulty,
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = pveAccept;