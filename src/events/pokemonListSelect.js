const { getState  } = require("../services/state");

const pokemonListSelect = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        await interaction.update({ 
            content: "This interaction has expired.",
            components: [] 
        });
        return { err: "This interaction has expired." };
    }

    // if data has userId component, verify interaction was done by that user
    if (state.userId && interaction.user.id !== state.userId) {
        return { err: "This interaction was not initiated by you." };
    }

    const pokemonId = interaction.values[0];
    await interaction.update({ 
        content: `${pokemonId}`, 
        embeds: interaction.message.embeds, 
        components: interaction.message.components
    });
}

module.exports = pokemonListSelect;