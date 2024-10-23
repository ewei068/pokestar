const { ButtonBuilder, ButtonStyle } = require("discord.js");
const { makeComponentId } = require("../deact");

module.exports = async (
  ref,
  {
    label,
    style = ButtonStyle.Secondary,
    disabled = false,
    callbackBindingKey,
    data,
  }
) => {
  const button = new ButtonBuilder()
    .setCustomId(makeComponentId(ref, callbackBindingKey, data))
    .setLabel(label)
    .setStyle(style)
    .setDisabled(disabled);

  return {
    components: [[button]],
  };
};
