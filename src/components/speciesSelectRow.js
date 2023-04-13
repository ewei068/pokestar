const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { pokemonConfig } = require('../config/pokemonConfig');

const buildSpeciesSelectRow = (speciesIds, data, eventName) => {
    const menuId = {
        eventName: eventName,
        ...data,
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`${JSON.stringify(menuId)}`)
        .setPlaceholder('Select a pokemon')
        .addOptions(speciesIds.map(speciesId => {
            const speciesData = pokemonConfig[speciesId];
            return {
                label: `${speciesData.name} #${speciesId}`,
                value: `${speciesId}`,
            }
        }));

    const actionRow = new ActionRowBuilder()
        .addComponents(selectMenu);

    return actionRow;
}

module.exports = {
    buildSpeciesSelectRow
};