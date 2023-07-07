/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * bannerGacha.js runs the gacha for the specific banner the user selected.
*/
const { getState } = require("../services/state");
const { usePokeball } = require("../services/gacha");
const { buildNewPokemonEmbed, buildNewPokemonListEmbed } = require("../embeds/pokemonEmbeds");
const { buildPokemonSelectRow } = require("../components/pokemonSelectRow");
const { eventNames } = require("../config/eventConfig");
const { getTrainer } = require("../services/trainer");
const { backpackCategories } = require("../config/backpackConfig");
const { buildButtonActionRow } = require("../components/buttonActionRow");

const bannerGacha = async (interaction, data) => {
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

    const quantity = data.quantity;
    if (!quantity) {
        return { err: "No quantity." };
    }
    const pokeballId = state.pokeballId;

    const trainer = await getTrainer(interaction.user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }

    // use pokeball
    const gacha = await usePokeball(trainer.data, pokeballId, state.index, quantity);
    if (gacha.err) {
        return { embed: null, err: gacha.err };
    }

    const gachaSend = {
        embeds: [],
        components: []
    }
    if (gacha.data.pokemons.length === 1) {
        // build Pokemon embed
        const pokemon = gacha.data.pokemons[0];
        embed = buildNewPokemonEmbed(
            pokemon,
            pokeballId, 
            trainer.data.backpack[backpackCategories.POKEBALLS][pokeballId]
        );
        gachaSend.content = `${pokemon._id}`;
        gachaSend.embeds.push(embed);
    } else {
        // build Pokemon embed
        embed = buildNewPokemonListEmbed(
            gacha.data.pokemons,
            pokeballId,
            trainer.data.backpack[backpackCategories.POKEBALLS][pokeballId]
        );
        // make list selector
        // build selection row for pokemon Ids
        const selectRowData = {}
        const pokemonSelectRow = buildPokemonSelectRow(
            gacha.data.pokemons, 
            selectRowData, 
            eventNames.POKEMON_LIST_SELECT
        );
        gachaSend.embeds.push(embed);
        gachaSend.components.push(pokemonSelectRow);
    }

    // push a return button
    const returnData = {
        stateId: data.stateId,
        pokeballId: pokeballId,
    }
    const returnButtonConfig = [{
        label: "Return",
        disabled: false,
        data: returnData,
    }]
    const returnButton = buildButtonActionRow(returnButtonConfig, eventNames.BANNER_BUTTON);
    gachaSend.components.push(returnButton);

    await interaction.update(gachaSend);
}

module.exports = bannerGacha;