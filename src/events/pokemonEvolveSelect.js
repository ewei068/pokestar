const { getPokemon, getEvolvedPokemon } = require('../services/pokemon');
const { getState } = require('../services/state');
const { getTrainer } = require('../services/trainer');
const { buildPokemonEmbed } = require('../embeds/pokemonEmbeds');
const { buildButtonActionRow } = require('../components/buttonActionRow');
const { eventNames } = require('../config/eventConfig');

const pokemonEvolveSelect = async (interaction, data) => {
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

    // update embed to selected evolution
    const speciesId = interaction.values[0];
    state.speciesId = speciesId;
    const evolvedPokemon = getEvolvedPokemon(pokemon.data, speciesId);
    const embed = buildPokemonEmbed(trainer.data, evolvedPokemon);

    // get confirm button
    const rowData = {
        stateId: data.stateId
    }
    const confirmButtonRow = buildButtonActionRow(
        [{
            label: 'Evolve!',
            disabled: false,
        }],
        rowData,
        eventNames.POKEMON_EVOLVE_CONFIRM
    )

    // if message components length > 1, replace with last component, else append
    if (interaction.message.components.length > 1) {
        interaction.message.components[1] = confirmButtonRow;
    } else {
        interaction.message.components.push(confirmButtonRow);
    }

    await interaction.update({ 
        content: interaction.message.content, 
        embeds: [embed],
        components: interaction.message.components
    });
}

module.exports = pokemonEvolveSelect;