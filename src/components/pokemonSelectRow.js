const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { pokemonConfig } = require("../config/pokemonConfig");

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