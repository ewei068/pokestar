const { getState } = require("../services/state");
const { buildNatureSend } = require("../services/pokemon");

const natureSelect = async (interaction, data) => {
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

    // get which option was selected
    const option = interaction.values[0];
    if (!option) {
        return { err: "No option was selected." };
    }
    state.natureId = option;

    const { send, err } = await buildNatureSend({
        stateId: data.stateId,
        user: interaction.user,
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = natureSelect;