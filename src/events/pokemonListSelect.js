const { getState  } = require("../services/state");
const { getTrainer } = require("../services/trainer");
const { getPokemon } = require("../services/pokemon");
const { buildPokemonEmbed } = require("../embeds/pokemonEmbeds");

const pokemonListSelect = async (interaction, data) => {
    // get state to refresh it if possible
    getState(data.stateId);

    const pokemonId = interaction.values[0];

    // get trainer
    const trainer = await getTrainer(interaction.user);

    // get pokemon
    const pokemon = await getPokemon(trainer.data, pokemonId);
    if (pokemon.err) {
        return { embed: null, err: pokemon.err };
    }

    // build pokemon embed
    const embed = buildPokemonEmbed(trainer.data, pokemon.data);

    await interaction.reply({ 
        content: `${pokemonId}`, 
        embeds: [embed],
    });
}

module.exports = pokemonListSelect;