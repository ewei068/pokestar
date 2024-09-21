/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * buttonActionRow.js creates action rows for actions to be added to it.
 */
const { ActionRowBuilder, ButtonStyle } = require("discord.js");
const { buildSingleButton } = require("./singleButton");

// buttonConfigs = [{
//  label,
//  disabled
//  ...
// }]
/**
 *
 * @param {*} buttonConfigs buttonConfigs = [{
 *  label?,
 *  disabled,
 *  data,
 *  emoji?,
 *  style?
 * }]
 * @param {*} eventName
 * @returns
 */
const buildButtonActionRow = (buttonConfigs, eventName, danger = false) => {
  let style;
  if (danger) {
    style = ButtonStyle.Danger;
  } else if (buttonConfigs.length === 1) {
    style = ButtonStyle.Primary;
  } else {
    style = ButtonStyle.Secondary;
  }

  const actionRow = new ActionRowBuilder().addComponents(
    buttonConfigs.map((buttonConfig) => {
      const button = buildSingleButton(
        buttonConfig.label,
        buttonConfig.emoji,
        buttonConfig.data,
        buttonConfig.style || style,
        buttonConfig.disabled,
        eventName
      );
      return button;
    })
  );

  return actionRow;
};

module.exports = {
  buildButtonActionRow,
};
