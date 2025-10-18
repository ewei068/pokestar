const { EmbedBuilder } = require("discord.js");
const { backpackItemConfig } = require("../config/backpackConfig");
const {
  bannerTypeConfig,
  pokeballConfig,
  rewardTypesConfig,
} = require("../config/gachaConfig");
const {
  pokemonConfig,
  rarities,
  rarityConfig,
} = require("../config/pokemonConfig");
const { trainerFields } = require("../config/trainerConfig");
const { getPokeballsString } = require("../utils/trainerUtils");
const {
  getOrSetDefault,
  getWhitespace,
  buildBlockQuoteString,
  linebreakString,
  buildAnsiString,
} = require("../utils/utils");
const { ansiTokens } = require("../enums/miscEnums");
const { formatProbability } = require("../utils/gachaUtils");

/**
 *
 * @param {Trainer} trainer
 * @param {BannerData} bannerData
 * @returns {EmbedBuilder}
 */
const buildBannerEmbed = (trainer, bannerData) => {
  const type = bannerData.bannerType;
  const rateUp = bannerData.rateUp() || {};
  const { pity } = getOrSetDefault(
    trainer,
    "banners",
    trainerFields.banners.default
  )[type];

  let displayPokemon = pokemonConfig["25"];
  if (rateUp[rarities.LEGENDARY]) {
    displayPokemon = pokemonConfig[rateUp[rarities.LEGENDARY][0]];
  }

  const rateUpRarities = Object.keys(rateUp);
  const rateUpWhitespace = getWhitespace(rateUpRarities);

  let rateUpString = "";
  for (let i = 0; i < rateUpRarities.length; i += 1) {
    const rarity = rateUpRarities[i];
    if (rateUp[rarity].length <= 0) {
      continue;
    }
    rateUpString += `\`${rateUpWhitespace[i]} ${rarity} \``;
    for (const speciesId of rateUp[rarity].slice(0, 15)) {
      const speciesData = pokemonConfig[speciesId];
      rateUpString += ` ${speciesData.emoji}`;
    }
    if (rateUp[rarity].length > 15) {
      rateUpString += ` ...and ${rateUp[rarity].length - 15} more!`;
    }
    rateUpString += "\n";
  }
  if (rateUpString === "") {
    rateUpString = "None";
  }

  const embed = new EmbedBuilder();
  embed.setTitle(`${displayPokemon.emoji} ${bannerData.name}`);
  embed.setDescription(
    buildBlockQuoteString(linebreakString(bannerData.description, 45))
  );
  embed.setColor(0xffffff);
  embed.setThumbnail(`${displayPokemon.sprite}`);
  embed.addFields(
    { name: "Type", value: `${bannerTypeConfig[type].name}`, inline: true },
    { name: "Pity", value: `${pity}/100`, inline: true },
    { name: "Rate Up", value: `${rateUpString}`, inline: false },
    {
      name: "Your Pokeballs",
      value: getPokeballsString(trainer),
      inline: false,
    }
  );
  embed.setFooter({
    text: "Get more Pokeballs with /daily, /vote, /levelrewards, /pokemart",
  });

  if (bannerData.image) {
    embed.setImage(bannerData.image);
  }

  return embed;
};

const buildGachaInfoString = () => {
  let infoString =
    "**Gacha Info**\nUse Pokeballs to draw Pokemon from the Gacha! Each Pokeball has a different chance of drawing a Pokemon, with **better Pokeballs being more likely to draw rarer Pokemon.** The higher the rarity, the lower the chance of drawing that Pokemon.\n\n";
  infoString += "**Getting Pokeballs**\n";
  infoString +=
    "You can get Pokeballs from `/daily` (3 random), `/vote` (2 per vote), `/tutorial`, `/pve` (daily), `/levelrewards`. and `/pokemart`.\n\n";
  infoString += "**Banners**\n";
  infoString +=
    "Scroll through the banners using the buttons. Each banner has a different set of rate-up Pokemon. **When a rarity is drawn, there is a 50% chance to get a random rate-up Pokemon of that rarity instead.** If there are no rate-ups for that rarity, the Pokemon is random. There are also 3 banner types: Standard, Rotating, and Special.\n\n";
  infoString += "**Pity**\n";
  infoString +=
    "Each banner has a pity counter. When a Pokemon is drawn, the pity counter increases according to the Pokeball used. **When the pity counter reaches 100, the next Pokemon drawn will be a random rate-up Legendary Pokemon,** or a random availible Legendary if no rate up. The pity counter resets when a rate-up Legendary Pokemon is drawn. Additionally, **pity is shared between all banners of the same type, and does not reset when rotating.**\n\n";
  infoString += "**Pokeballs**\n";
  for (const pokeball in pokeballConfig) {
    const { chances } = pokeballConfig[pokeball];
    const { pity } = pokeballConfig[pokeball];
    infoString += `${backpackItemConfig[pokeball].emoji} ${backpackItemConfig[pokeball].name}:`;
    for (const rarity in chances) {
      infoString += ` ${rarity}: ${Math.floor(chances[rarity] * 100)}% | `;
    }
    infoString += `Pity: ${pity}\n`;
  }
  return infoString;
};

/**
 * @param {RarityEnum} rarity
 * @param {PartialRecord<RarityEnum, number>} rewardDistribution
 * @param {PartialRecord<RarityEnum, PartialRecord<RewardTypeEnum, number>>} rewardsConfig
 * @returns {EmbedBuilder}
 */
const buildPossibleRewardsEmbed = (
  rarity,
  rewardDistribution,
  rewardsConfig
) => {
  const currentRewards = rewardsConfig[rarity];
  const currentProbability = rewardDistribution[rarity];

  // Build embed for current rarity
  const embed = new EmbedBuilder()
    .setTitle("Rewards Preview")
    .setColor(rarityConfig[rarity].color)
    .setDescription(
      buildAnsiString(
        `${rarityConfig[rarity].emoji} ${ansiTokens.BOLD}${
          rarityConfig[rarity].ansiColor
        }${rarityConfig[rarity].name}${ansiTokens.RESET} (${formatProbability(
          currentProbability
        )} chance)`
      )
    );

  // Format rewards for display
  if (currentRewards && Object.keys(currentRewards).length > 0) {
    const rewardStrings = [];
    for (const [rewardType, quantity] of Object.entries(currentRewards)) {
      const rewardConfig = rewardTypesConfig[rewardType];
      if (rewardConfig) {
        rewardStrings.push(
          `${rewardConfig.emoji} ${rewardConfig.display(quantity)}`
        );
      }
    }

    if (rewardStrings.length > 0) {
      embed.addFields({
        name: "🎁 Possible Rewards",
        value: buildBlockQuoteString(rewardStrings.join("\n")),
        inline: false,
      });
    }
  } else {
    embed.addFields({
      name: "🎁 Possible Rewards",
      value: "No rewards configured for this rarity",
      inline: false,
    });
  }

  return embed;
};

module.exports = {
  buildBannerEmbed,
  buildGachaInfoString,
  buildPossibleRewardsEmbed,
};
