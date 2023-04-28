const { getState } = require('../services/state');

const testEvent = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        await interaction.update({ 
            components: [] 
        });
        return { err: "This interaction has expired." };
    }

    if (data.yes) {
        await interaction.update({ 
            content: "You pressed yes!"
        });
    } else {
        const messageRef = state.extra;
        await messageRef.edit("You pressed no!");
    }
}

module.exports = testEvent;
