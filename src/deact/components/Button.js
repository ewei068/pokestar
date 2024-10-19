const { ButtonBuilder } = require("discord.js");
const { makeComponentId } = require("../deact");

module.exports = async (
  ref,
  { label, style, disabled = false, bindingKey, data }
) => {
  const button = new ButtonBuilder()
    .setCustomId(makeComponentId(ref, bindingKey, data))
    .setLabel(label)
    .setStyle(style)
    .setDisabled(disabled);

  return {
    components: [[button]],
  };
};
