/**
 * @file
 * @author Elvis Wei
 *
 * jirachi.js jirachi.
 */
const { createRoot } = require("../../deact/deact");
const Jirachi = require("../../elements/pokemon/Jirachi");
const { getUserFromInteraction } = require("../../utils/utils");

const jirachi = async (interaction) =>
  await createRoot(
    Jirachi,
    {
      user: getUserFromInteraction(interaction),
    },
    interaction,
    { ttl: 180 }
  );

const jirachiMessageCommand = async (message) => await jirachi(message);

const jirachiSlashCommand = async (interaction) => await jirachi(interaction);

module.exports = {
  message: jirachiMessageCommand,
  slash: jirachiSlashCommand,
};
