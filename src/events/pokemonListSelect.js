const { getState  } = require("../services/state");
const { buildPokemonInfoSend } = require("../services/pokemon");

const pokemonListSelect = async (interaction, data) => {
    // get state to refresh it if possible
    getState(data.stateId);

    const pokemonId = interaction.values[0];

    const { send, err } = await buildPokemonInfoSend({
        user: interaction.user,
        pokemonId: pokemonId
    });
    if (err) {
        return { err: err };
    }

    await interaction.reply(send);
}

module.exports = pokemonListSelect;