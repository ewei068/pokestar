const { getState } = require('../services/state');
const { getTrainer } = require('../services/trainer');
const { getPokemon, evolvePokemon } = require('../services/pokemon');
const { buildPokemonEmbed } = require('../embeds/pokemonEmbeds');

const pokemonEvolveConfirm = async (interaction, data) => {
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
    // if no pokemon selected, return
    if (!state.speciesId) {
        return;
    }

    // get trainer
    const trainer = await getTrainer(interaction.user);
    if (trainer.err) {
        return;
    }

    // get pokemon
    const pokemon = await getPokemon(trainer.data, state.pokemonId);
    if (pokemon.err) {
        return;
    }
    const originalName = pokemon.data.name;

    // evolve pokemon
    const speciesId = state.speciesId;
    const evolveResult = await evolvePokemon(pokemon.data, speciesId);
    if (evolveResult.err) {
        return;
    }
    const { pokemon: evolvedPokemon, species: newName } = evolveResult.data;

    // update embed to selected evolution
    const embed = buildPokemonEmbed(trainer.data, evolvedPokemon);

    await interaction.update({ 
        content: `Your ${originalName} evolved into a ${newName}!`,
        embeds: [embed],
        components: []
    });
}

module.exports = pokemonEvolveConfirm;