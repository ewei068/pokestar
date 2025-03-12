/**
 * @file
 * @author Elvis Wei
 *
 * craft.js Is file that creates an interactive menu to craft items
 */
const { createRoot } = require("../../deact/deact");
const CraftList = require("../../elements/shop/CraftList");
const { getUserFromInteraction } = require("../../utils/utils");

/**
 * Displays the user's backpack items.
 * @param {any} interaction
 * @param {string=} searchString
 */
const craft = async (interaction, searchString) =>
  await createRoot(
    CraftList,
    {
      user: getUserFromInteraction(interaction),
      searchString,
    },
    interaction,
    { defer: false, ttl: 240 }
  );

const craftMessageCommand = async (message) => {
  const searchString =
    message.content.split(" ").slice(1).join(" ") || undefined;
  return await craft(message, searchString);
};

const craftSlashCommand = async (interaction) => {
  const searchString = interaction.options.getString("search");
  return await craft(interaction, searchString);
};

module.exports = {
  message: craftMessageCommand,
  slash: craftSlashCommand,
};
