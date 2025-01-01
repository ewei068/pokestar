const { ButtonBuilder, ButtonStyle } = require("discord.js");
const { makeComponentId } = require("../deact");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {string?=} param1.label
 * @param {string?=} param1.emoji
 * @param {ButtonStyle?=} param1.style
 * @param {boolean?=} param1.disabled
 * @param {string} param1.callbackBindingKey
 * @param {any=} param1.data
 */
module.exports = async (
  ref,
  {
    label,
    emoji,
    style = ButtonStyle.Secondary,
    disabled = false,
    callbackBindingKey,
    data = {},
  }
) => {
  const button = new ButtonBuilder()
    .setCustomId(makeComponentId(ref, callbackBindingKey, data))
    .setStyle(style)
    .setDisabled(disabled);

  if (label) {
    button.setLabel(label);
  }
  if (emoji) {
    button.setEmoji(emoji);
  }

  return {
    components: [[button]],
  };
};
