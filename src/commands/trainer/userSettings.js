/**
 * @file
 * @author Elvis Wei
 *
 * userSettings.js Creates a system to display and edit the user's settings for them.
 */
const { createRoot } = require("../../deact/deact");
const UserSettings = require("../../elements/trainer/UserSettings");
const { getUserFromInteraction } = require("../../utils/utils");

const userSettings = async (interaction) =>
  await createRoot(
    UserSettings,
    {
      user: getUserFromInteraction(interaction),
    },
    interaction,
    { ttl: 180 }
  );

const userSettingsMessageCommand = async (message) =>
  await userSettings(message);

const userSettingsSlashCommand = async (interaction) =>
  await userSettings(interaction);

module.exports = {
  message: userSettingsMessageCommand,
  slash: userSettingsSlashCommand,
};
