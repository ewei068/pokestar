/**
 * @file
 * @author Elvis Wei
 *
 * darkrai.js darkrai.
 */
const { createRoot } = require("../../deact/deact");
const Darkrai = require("../../elements/pokemon/Darkrai");
const { getUserFromInteraction } = require("../../utils/utils");

const darkrai = async (interaction) =>
  await createRoot(
    Darkrai,
    {
      user: getUserFromInteraction(interaction),
    },
    interaction,
    { ttl: 180 }
  );

const darkraiMessageCommand = async (message) => await darkrai(message);

const darkraiSlashCommand = async (interaction) => await darkrai(interaction);

module.exports = {
  message: darkraiMessageCommand,
  slash: darkraiSlashCommand,
};
