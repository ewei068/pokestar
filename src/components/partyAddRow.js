const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { eventNames } = require("../config/eventConfig");

const partyAddRow = (pokemonId, size=12) => {
    const menuId = {
        eventName: eventNames.PARTY_ADD,
        id: pokemonId
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`${JSON.stringify(menuId)}`)
        .setPlaceholder("Select a position")
        .addOptions(Array.from(Array(size).keys()).map(i => {
            return {
                label: `Position ${i+1}`,
                value: `${i+1}`,
            }
        }));

    const actionRow = new ActionRowBuilder()
        .addComponents(selectMenu);

    return actionRow;
}

module.exports = {
    partyAddRow
};