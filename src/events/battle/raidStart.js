const { buildRaidSend, onRaidStart } = require("../../services/raid");
const { getState } = require("../../services/state");

const raidStart = async (interaction, data) => {
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

    const difficulty = data.difficulty;
    state.difficulty = difficulty;
    const actionRes = await onRaidStart({
        stateId: data.stateId,
        user: interaction.user,
    });
    if (actionRes.err) {
        return { err: actionRes.err };
    }

    // set state's interaction message
    state.messageRef = interaction.message;

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

module.exports = raidStart;