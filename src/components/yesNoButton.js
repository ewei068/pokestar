/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * yesNoActionRow.js Creates a Button using discordjs's ButtonBuilder for Yes/No options.
 */
const { ButtonBuilder, ButtonStyle } = require("discord.js");

/**
 * Creates a Button using discordjs's ButtonBuilder for Yes/No options.
 * @param {*} yes yes.
 * @param {*} data the data the button contains.
 * @param {*} eventName the name of the event the button calls.
 * @param {*} danger danger Will Robinson. Set to false, but changes button style if true.
 * @returns ButtonBuilder
 */
const buildYesNoButton = (yes, data, eventName, danger = false) => {
  const buttonId = JSON.stringify({
    yes,
    eventName,
    ...data,
  });

  let buttonSyle = ButtonStyle.Secondary;
  if (danger && yes) {
    buttonSyle = ButtonStyle.Danger;
  } else if (yes) {
    buttonSyle = ButtonStyle.Success;
  }

  const button = new ButtonBuilder()
    .setCustomId(buttonId)
    .setLabel(yes ? "Yes" : "No")
    .setStyle(buttonSyle);

  return button;
};

module.exports = {
  buildYesNoButton,
};
