/**
 * @file
 * @author Elvis Wei
 *
 * backpack.js Creates a system to display the user's backpack for them.
 */
const { createRoot } = require("../../deact/deact");
const BackpackEntryPoint = require("../../elements/trainer/BackpackEntryPoint");
const { getUserFromInteraction } = require("../../utils/utils");

/**
 * Displays the user's backpack items.
 * @param {any} interaction
 * @param {string=} category
 */
const backpack = async (interaction, category) =>
  await createRoot(
    BackpackEntryPoint,
    {
      user: getUserFromInteraction(interaction),
      backpackCategoryInput: category,
    },
    interaction,
    { defer: false, ttl: 180 }
  );

const backpackMessageCommand = async (message) => {
  const category = message.content.split(" ")[1];
  return await backpack(message, category);
};

const backpackSlashCommand = async (interaction) => {
  const category = interaction.options.getString("category");
  return await backpack(interaction, category);
};

module.exports = {
  message: backpackMessageCommand,
  slash: backpackSlashCommand,
};
