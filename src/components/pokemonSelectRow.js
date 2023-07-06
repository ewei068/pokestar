/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * pokemonSelectRow.js creates the pokemon select row within the ActionRowBuilder. Yea that's about it.
*/
const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { pokemonConfig } = require("../config/pokemonConfig");

/**
 * creates the pokemon select row within the ActionRowBuilder. Yea that's about it.
 * @param {*} pokemons  the pokemon that are selectable.
 * @param {*} data the data necessary for the row?
 * @param {*} eventName the name of the event for the menuId to reference.
 * @returns ActionRowBuilder
 */
const buildPokemonSelectRow = (pokemons, data, eventName) => {
    const menuId = {
        eventName: eventName,
        ...data,
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`${JSON.stringify(menuId)}`)
        .setPlaceholder('Select a pokemon')
        .addOptions(pokemons.map(pokemon => {
            const speciesData = pokemonConfig[pokemon.speciesId];
            return {
                label: `${pokemon.name} (${pokemon._id})`,
                value: `${pokemon._id}`,
                emoji: speciesData.emoji,
            }
        }));

    const actionRow = new ActionRowBuilder()
        .addComponents(selectMenu);

    return actionRow;
}

module.exports = {
    buildPokemonSelectRow
};