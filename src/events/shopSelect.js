const { getState } = require("../services/state");
const { buildShopSend } = require("../services/shop");

const shopSelect = async (interaction, data) => {
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

    // get which select menu was used
    const select = data.select;
    if (!select) {
        return { err: "No select menu was used." };
    }

    // get which option was selected
    const option = interaction.values[0];
    if (!option) {
        return { err: "No option was selected." };
    }

    const { send, err } = await buildShopSend({
        stateId: data.stateId,
        user: interaction.user,
        view: select,
        option: option
    });
    if (err) {
        return { err: err };
    } else {
        await interaction.update(send);
    }
}

module.exports = shopSelect;