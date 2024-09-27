/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * partyAddRow.js is the ActionRowBuilder Row for the partyAdd event feature
 */
const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { eventNames } = require("../config/eventConfig");

/**
 * Creates the ActionRowBuilder Row for the partyAdd event feature
 * @param {*} pokemonId the Id of the pokemon user is adding to party.
 * @param {*} size the number of possible positions to add to.
 * @returns ActionRowBuilder
 */
const partyAddRow = (pokemonId, size = 12) => {
  const menuId = {
    eventName: eventNames.PARTY_ADD,
    id: pokemonId,
  };

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`${JSON.stringify(menuId)}`)
    .setPlaceholder("Select a position")
    .addOptions(
      Array.from(Array(size).keys()).map((i) => ({
        label: `Position ${i + 1}`,
        value: `${i + 1}`,
      }))
    );

  const actionRow = new ActionRowBuilder().addComponents(selectMenu);

  return actionRow;
};

module.exports = {
  partyAddRow,
};
