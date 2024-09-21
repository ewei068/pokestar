/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * scrollActionRow.js Creates the scroll action row for the action row builder.
 */
const { ActionRowBuilder } = require("discord.js");
const { buildScrollButton } = require("./scrollButton");

/**
 * Creates the scroll action row for the action row builder.
 * @param {*} page the page for the scroll action.
 * @param {*} lastPage the last page.
 * @param {*} data the data to put into the scroll button
 * @param {*} eventName the Id of the event for the scrollbutton.
 * @returns ActionRowBuilder
 */
const buildScrollActionRow = (page, lastPage, data, eventName) => {
  const actionRow = new ActionRowBuilder();
  const leftButton = buildScrollButton(
    true,
    data,
    page - 1,
    page <= 1,
    eventName
  );
  const rightButton = buildScrollButton(
    false,
    data,
    page + 1,
    lastPage,
    eventName
  );
  actionRow.addComponents(leftButton, rightButton);

  return actionRow;
};

module.exports = {
  buildScrollActionRow,
};
