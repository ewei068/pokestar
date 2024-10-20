const { StringSelectMenuBuilder } = require("discord.js");
const { makeComponentId } = require("../deact");

module.exports = async (
  ref,
  { placeholder, options, callbackBindingKey, data }
) => {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(makeComponentId(ref, callbackBindingKey, data))
    .addOptions(options);
  if (placeholder) {
    selectMenu.setPlaceholder(placeholder);
  }

  return {
    components: [[selectMenu]],
  };
};
