const { getState } = require("../../services/state");
const { buildDungeonSend } = require("../../services/battle");

const dungeonAccept = async (interaction, data) => {
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

    if (data.difficulty === undefined) {
        // return button pressed
        const { send, err } = await buildDungeonSend({
            stateId: data.stateId,
            user: interaction.user,
            view: "list",
        });
        if (err) {
            return { err: err };
        } else {
            await interaction.update(send);
        }
    } else {
        state.difficulty = data.difficulty;
        const { send, err } = await buildDungeonSend({
            stateId: data.stateId,
            user: interaction.user,
            view: "battle",
        });
        if (err) {
            return { err: err };
        } else {
            await interaction.update(send);
        }
    }
}

module.exports = dungeonAccept;