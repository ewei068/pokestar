/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * singleButton.js creates a single button using discordjs's ButtonBuilder.
 */
const { ButtonBuilder } = require("discord.js");

/**
 * creates a single button using discordjs's ButtonBuilder.
 * @param {*} label name for the button.
 * @param {*} emoji any emoji the button may use for visuals.
 * @param {*} data the data the button contains.
 * @param {*} style the style of the button.
 * @param {*} disabled whether the button is disabled or not.
 * @param {*} eventName the name of the event the button calls.
 * @returns ButtonBuilder
 */
const buildSingleButton = (label, emoji, data, style, disabled, eventName) => {
  const buttonId = {
    eventName,
    ...data,
  };

  const button = new ButtonBuilder()
    .setCustomId(`${JSON.stringify(buttonId)}`)
    .setStyle(style)
    .setDisabled(disabled);
  if (label) {
    button.setLabel(label);
  }
  if (emoji) {
    button.setEmoji(emoji);
  }
  return button;
};

module.exports = {
  buildSingleButton,
};
