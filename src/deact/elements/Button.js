const { ButtonBuilder, ButtonStyle } = require("discord.js");
const { makeComponentId } = require("../deact");

module.exports = async (
  ref,
  {
    label = undefined,
    emoji = undefined,
    style = ButtonStyle.Secondary,
    disabled = false,
    callbackBindingKey,
    data,
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
