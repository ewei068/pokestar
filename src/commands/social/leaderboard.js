/**
 * @file
 * @author Elvis Wei
 *
 * leaderboard.js is used as a way to interact with users more and give users a goal. It displas the top 10 leaderboard for a given category and scope.
 */
const { createRoot, userTypeEnum } = require("../../deact/deact");
const Leaderboard = require("../../elements/social/Leaderboard");

/**
 * Creates and returns a Deact root for the leaderboard.
 * @param {any} interaction The interaction (message or slash command)
 * @param {string} initialCategory Initial category for the leaderboard
 * @param {string} initialScope Initial scope for the leaderboard
 * @param {any} guild Guild object for server-scoped leaderboards
 * @returns {Promise<any>} The result of createRoot
 */
const leaderboard = async (interaction, initialCategory, initialScope, guild) =>
  createRoot(
    Leaderboard,
    {
      initialCategory,
      initialScope,
      guild,
    },
    interaction,
    {
      userIdForFilter: userTypeEnum.ANY,
    }
  );

const leaderboardMessageCommand = async (message, client) => {
  const args = message.content.split(" ");
  const category = args[1] || "level"; // Default to level
  const scope = args[2] || "global"; // default to global

  return await leaderboard(
    message,
    category,
    scope,
    client.guilds.cache.get(message.guild.id)
  );
};

const leaderboardSlashCommand = async (interaction, client) => {
  const category = interaction.options.getString("category") || "level"; // Default to level
  const scope = interaction.options.getString("scope") || "global"; // default to global

  return await leaderboard(
    interaction,
    category,
    scope,
    client.guilds.cache.get(interaction.guild.id)
  );
};

module.exports = {
  message: leaderboardMessageCommand,
  slash: leaderboardSlashCommand,
};
