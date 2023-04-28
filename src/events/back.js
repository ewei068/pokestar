const { getState } = require("../services/state");

const back = async (interaction, data) => {
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

    // remove last message from stack
    const lastMessage = state.messageStack.pop();
    if (!lastMessage) {
        return { err: "No previous message." };
    }

    // get message prior to last message
    const message = state.messageStack[state.messageStack.length - 1];

    // update message
    await interaction.update(message);
}

module.exports = back;