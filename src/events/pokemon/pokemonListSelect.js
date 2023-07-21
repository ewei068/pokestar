const { getState  } = require("../../services/state");
const { buildPokemonInfoSend, buildPokemonAllInfoSend } = require("../../services/pokemon");

const pokemonListSelect = async (interaction, data) => {
    // get state to refresh it if possible
    getState(data.stateId);

    const pokemonId = interaction.values[0];

    let res = {};
    if (data.userId) {
        res = await buildPokemonAllInfoSend({
            userId: data.userId,
            pokemonId: pokemonId
        });

    } else {
        res = await buildPokemonInfoSend({
            user: interaction.user,
            pokemonId: pokemonId
        });
    }
    if (res.err) {
        return { err: res.err };
    }

    await interaction.reply(res.send);
}

module.exports = pokemonListSelect;