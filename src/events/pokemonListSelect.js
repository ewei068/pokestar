const { listPokemons: listPokemon } = require("../services/pokemon");
const { getState  } = require("../services/state");

const pokemonListSelect = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        await interaction.update({ 
            content: "This interaction has expired.",
            components: [] 
        });
        return;
    }

    // if data has userId component, verify interaction was done by that user
    if (state.userId && interaction.user.id !== state.userId) {
        return;
    }

    const pokemonId = interaction.values[0];
    await interaction.update({ 
        content: `${pokemonId}`, 
        embeds: interaction.message.embeds, 
        components: interaction.message.components
    });
}

module.exports = pokemonListSelect;