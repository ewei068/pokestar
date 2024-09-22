/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * socialEmbeds.js Creates the embed's for social interactions such as the leaderboards and voting.
 */
const { EmbedBuilder } = require("discord.js");
const { getFullUsername } = require("../utils/trainerUtils");
const { getVoteMultiplier } = require("../config/socialConfig");
const { formatMoney } = require("../utils/utils");
const { pokemonConfig } = require("../config/pokemonConfig");

const buildLeaderboardEmbed = (leaderboardInfo, categoryData, scope) => {
  let leaderboardString = "";
  let prevPosition = 0;
  let prevValue = 0;
  for (let index = 0; index < leaderboardInfo.length; index += 1) {
    const entry = leaderboardInfo[index];
    let position = index + 1;
    if (index > 0 && entry.label === prevValue) {
      position = prevPosition;
    }
    leaderboardString += `**${position}.** ${getFullUsername(entry.user)} - ${
      entry.label
    }\n`;

    prevPosition = position;
    prevValue = entry.label;
  }

  const embed = new EmbedBuilder()
    .setTitle(`Top ${categoryData.name} (${scope})`)
    .setColor("#FFFFFF")
    .addFields({ name: "Top 10", value: leaderboardString, inline: true });
  return embed;
};

const buildVoteEmbed = (trainer) => {
  const { voting } = trainer;

  const embed = new EmbedBuilder();
  embed.setTitle("Vote for Pokestar!");
  embed.setDescription(
    "Vote on the sites below every 12 hours, then click the Claim Rewards button to claim rewards!\n\nVote often to accumulate a streak and earn up to 5x the rewards! Additionally, top.gg votes give twice the rewards!"
  );
  embed.setColor("#FFFFFF");
  embed.setThumbnail(
    "https://cdn.discordapp.com/avatars/1093411444877439066/d4b45f3d46965964f6a913eb6825541a.png"
  );
  embed.addFields(
    { name: "Rewards", value: `${voting.rewards}`, inline: true },
    {
      name: "Reward Multiplier",
      value: `${getVoteMultiplier(voting.streak)}x`,
      inline: true,
    },
    { name: "** **", value: "** **", inline: false },
    { name: "Streak", value: `${voting.streak}`, inline: true },
    {
      name: "Streak Expires",
      value: `<t:${Math.floor(
        (voting.lastVoted + 48 * 60 * 60 * 1000) / 1000
      )}:R>`,
      inline: true,
    }
  );

  return embed;
};

const buildTradeEmbed = (trainer, pokemons, money) => {
  let pokemonString = `**${formatMoney(money)}**\n\n`;
  for (let i = 0; i < pokemons.length; i += 1) {
    const pokemon = pokemons[i];
    const speciesData = pokemonConfig[pokemons[i].speciesId];
    const ivPercent = (pokemon.ivTotal * 100) / (31 * 6);

    pokemonString += `${pokemon.shiny ? "✨" : ""}${speciesData.emoji} **[Lv. ${
      pokemon.level
    }] [IV ${Math.round(ivPercent)}%]** ${pokemon.name} (${pokemon._id})\n`;
  }
  const embed = new EmbedBuilder();
  embed.setTitle(`${trainer.user.username}'s Trade Offer`);
  embed.setDescription(pokemonString);
  embed.setColor("#FFFFFF");
  embed.setThumbnail(
    `https://cdn.discordapp.com/avatars/${trainer.userId}/${trainer.user.avatar}.webp`
  );

  return embed;
};

module.exports = {
  buildLeaderboardEmbed,
  buildVoteEmbed,
  buildTradeEmbed,
};
