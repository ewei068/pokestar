/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * scrollButton.js The builder for the scroll button itself for the scrollActionRow to use.
 */
const { ButtonBuilder, ButtonStyle } = require("discord.js");

/**
 * The builder for the scroll button itself for the scrollActionRow to use.
 * @param {*} isLeft boolean for checking if there's a left.
 * @param {*} data the data to add to the button.
 * @param {*} page the page the button will be on.
 * @param {*} disabled whether this button is disabled.
 * @param {*} eventName the Id of the event the button causes.
 * @returns ButtonBuilder
 */
const buildScrollButton = (isLeft, data, page, disabled, eventName) => {
  const buttonId = {
    page,
    eventName,
    ...data,
  };

  const button = new ButtonBuilder()
    .setCustomId(`${JSON.stringify(buttonId)}`)
    .setLabel(isLeft ? "◄" : "►")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(disabled);
  return button;
};

module.exports = {
  buildScrollButton,
};
