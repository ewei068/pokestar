const { EmbedBuilder } = require("discord.js");
const { buildAnsiString } = require("../utils/utils");
const { ansiTokens } = require("../enums/miscEnums");

/**
 * @param {GuildData} guildData
 * @param {string[]} channelIds
 * @param {number} page
 * @returns {EmbedBuilder}
 */
const buildSpawnManagerEmbed = (guildData, channelIds, page = 1) => {
  const embed = new EmbedBuilder();
  embed.setTitle("Server Spawn Manager");
  embed.setColor(0xffffff);

  const { mode } = guildData.spawnSettings;
  let description = `Channel Spawn Mode: ${ansiTokens.BOLD}`;
  description +=
    mode === "allowlist"
      ? `${ansiTokens.TEXT_GREEN}Allowlist${ansiTokens.RESET}`
      : `${ansiTokens.TEXT_RED}Denylist${ansiTokens.RESET}`;
  description += "\n\n";
  description +=
    mode === "allowlist"
      ? `Pokemon may spawn in all channels in the Channel List. ${ansiTokens.BOLD}In ALL other channels${ansiTokens.RESET}, spawning is disabled.`
      : `Pokemon will NOT spawn in any channels in the Channel List. ${ansiTokens.BOLD}In ALL other channels${ansiTokens.RESET}, spawning may occur.`;
  embed.setDescription(buildAnsiString(description));

  embed.addFields({
    name: mode === "allowlist" ? "Allowed Channel List" : "Denied Channel List",
    value: channelIds.length
      ? channelIds.map((id) => `<#${id}>`).join(", ")
      : "No channels in list.",
  });

  embed.setFooter({ text: `Page ${page}` });

  return embed;
};

module.exports = { buildSpawnManagerEmbed };
