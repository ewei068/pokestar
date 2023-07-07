/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * natureConfirm.js Builds the confirmation menu for the nature selected for the pokemon.
*/
const { getState } = require("../services/state");
const { getPokemon, calculateAndUpdatePokemonStats } = require("../services/pokemon");
const { natureConfig, pokemonConfig } = require("../config/pokemonConfig");
const { getTrainer, updateTrainer } = require("../services/trainer");
const { backpackItemConfig, backpackItems } = require("../config/backpackConfig");
const { getItems, removeItems } = require("../utils/trainerUtils");

const natureConfirm = async (interaction, data) => {
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

    // get which option was selected
    const natureId = state.natureId;
    const natureData = natureConfig[natureId];
    if (!natureData) {
        return { err: "Invalid nature selection." };
    }

    // get trainer
    let trainer = await getTrainer(interaction.user);
    if (trainer.err) {
        return { err: trainer.err };
    }
    trainer = trainer.data;

    // get pokemon
    let pokemon = await getPokemon(trainer, state.pokemonId);
    if (pokemon.err) {
        return { err: pokemon.err };
    }
    pokemon = pokemon.data;

    // if pokemon already has same nature, err
    if (pokemon.natureId === natureId) {
        return { err: "This pokemon already has this nature." };
    }

    // check for mint
    const mintCount = getItems(trainer, backpackItems.MINT);
    if (mintCount < 1) {
        return { err: "You do not have a mint! Get them daily from `/pve palmer`." };
    }

    // reduce mint count
    removeItems(trainer, backpackItems.MINT, 1);
    const reduceMint = await updateTrainer(trainer);
    if (reduceMint.err) {
        return { err: reduceMint.err };
    }

    // set pokemon nature
    pokemon.natureId = natureId;
    const natureChange = await calculateAndUpdatePokemonStats(pokemon, pokemonConfig[pokemon.speciesId], true);
    if (natureChange.err) {
        return { err: natureChange.err };
    }

    await interaction.update({ 
        content: `Changed ${pokemon.name}'s nature to ${natureData.name} for 1 ${backpackItemConfig[backpackItems.MINT].emoji}!`,
        components: [] 
    });
}

module.exports = natureConfirm;