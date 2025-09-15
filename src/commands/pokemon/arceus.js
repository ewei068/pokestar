/**
 * @file
 * @author Elvis Wei
 *
 * arceus.js arceus.
 */
const { createRoot } = require("../../deact/deact");
const Arceus = require("../../elements/pokemon/Arceus");
const { getUserFromInteraction } = require("../../utils/utils");

const arceus = async (interaction) =>
  await createRoot(
    Arceus,
    {
      user: getUserFromInteraction(interaction),
    },
    interaction,
    { ttl: 180, defer: true }
  );

const arceusMessageCommand = async (message) => await arceus(message);

const arceusSlashCommand = async (interaction) => await arceus(interaction);

module.exports = {
  message: arceusMessageCommand,
  slash: arceusSlashCommand,
};
