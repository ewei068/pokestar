const { StringSelectMenuBuilder } = require("discord.js");
const { makeComponentId } = require("../deact");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {string?=} param1.placeholder
 * @param {any[]} param1.options
 * @param {string} param1.callbackBindingKey
 * @param {any} param1.data
 */
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
