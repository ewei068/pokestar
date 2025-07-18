/**
 * @file
 * @author Elvis Wei
 *
 * trainerEmbeds.js Creates the embed for the trainer and their backpack and interactions to show them and the trainer's owned locations.
 */
const { EmbedBuilder } = require("discord.js");
const {
  getTrainerLevelExp,
  MAX_TRAINER_LEVEL,
} = require("../config/trainerConfig");
const {
  backpackCategoryConfig,
  backpackItemConfig,
} = require("../config/backpackConfig");
const { getPBar, getWhitespace, formatMoney } = require("../utils/utils");
const { locationConfig } = require("../config/locationConfig");
const { formatDreamCards } = require("../utils/trainerUtils");
const { emojis } = require("../enums/emojis");

/*
"trainer": {
    userId
    user
    level
    money
    exp
    lastCorrected (date)
    backpack
}
*/

/**
 * @param {Trainer & {
 *  numPokemon: number,
 *  totalPower: number,
 *  totalWorth: number,
 *  totalShiny: number
 * }} trainerInfo
 * @returns {EmbedBuilder}
 */
const buildTrainerEmbed = (trainerInfo) => {
  const oldLevelExp = getTrainerLevelExp(trainerInfo.level);
  const newLevelExp = getTrainerLevelExp(trainerInfo.level + 1);
  const levelPercent =
    trainerInfo.level === MAX_TRAINER_LEVEL
      ? 0
      : (100 * (trainerInfo.exp - oldLevelExp)) / (newLevelExp - oldLevelExp);
  const progressBar = `${getPBar(levelPercent, 20)} -- ${Math.round(
    levelPercent
  )}%`;

  const embed = new EmbedBuilder();
  embed.setTitle(`Trainer ${trainerInfo.user.username}`);
  embed.setColor(0xffffff);
  embed.setThumbnail(
    `https://cdn.discordapp.com/avatars/${trainerInfo.userId}/${trainerInfo.user.avatar}.webp`
  );
  embed.addFields(
    { name: "Level", value: `🚀 ${trainerInfo.level}`, inline: true },
    {
      name: "Money",
      value: `💵 ${formatMoney(trainerInfo.money)}`,
      inline: true,
    },
    {
      name: `Pokemon`,
      value: `${emojis.POKEBALL} ${trainerInfo.numPokemon}`,
      inline: true,
    },
    { name: "Power", value: `💪 ${trainerInfo.totalPower}`, inline: true },
    {
      name: "Worth",
      value: `💎 ${formatMoney(trainerInfo.totalWorth)}`,
      inline: true,
    },
    { name: "Shinies", value: `✨ ${trainerInfo.totalShiny}`, inline: true },
    { name: "Level Progress", value: `⏳ ${progressBar}`, inline: false }
  );

  const footerString = "Use /settings to make your profile private";
  embed.setFooter({ text: footerString });

  return embed;
};

/**
 * @param {Trainer} trainer
 * @returns {EmbedBuilder}
 */
const DEPRECATEDbuildBackpackEmbed = (trainer) => {
  // create string with backpack categories and their item quantities
  const fields = Object.entries(trainer.backpack).map(([category, items]) => {
    const categoryConfig = backpackCategoryConfig[category];
    let categoryString = "";
    for (const item in items) {
      if (items[item] === 0) {
        continue;
      }
      const itemConfig = backpackItemConfig[item];
      const whitespaceName = getWhitespace([itemConfig.name], 20)[0];
      categoryString += `${itemConfig.emoji} \`${itemConfig.name}${whitespaceName}${items[item]}\`\n`;
    }
    if (categoryString === "") {
      categoryString = "No items found!";
    }

    return {
      name: `=== ${categoryConfig.emoji} ${categoryConfig.name} ===`,
      value: categoryString,
      inline: false,
    };
  });

  const embed = new EmbedBuilder();
  embed.setTitle(`Trainer ${trainer.user.username}'s Backpack`);
  embed.setColor(0xffffff);
  embed.setThumbnail(
    `https://cdn.discordapp.com/avatars/${trainer.userId}/${trainer.user.avatar}.webp`
  );
  embed.setDescription(`You have ${formatMoney(trainer.money)} Pokédollars.`);
  embed.addFields(...fields);

  return embed;
};

/**
 * @param {BackpackItemEnum[]} itemIds
 * @param {FlattenedBackpack} flattenedBackpack
 * @param {object} param2
 * @param {number=} param2.money
 * @param {boolean=} param2.shouldShowMoney
 * @param {boolean=} param2.shouldShowDescription
 * @param {number=} param2.dreamCards
 * @param {boolean=} param2.shouldShowDreamCards
 * @param {number=} param2.maxDreamCards
 * @returns {EmbedBuilder}
 */
const buildBackpackEmbed = (
  itemIds,
  flattenedBackpack,
  {
    money = 0,
    shouldShowMoney = true,
    shouldShowDescription = false,
    dreamCards,
    maxDreamCards,
    shouldShowDreamCards = false,
  }
) => {
  const allCategories = itemIds
    .map((itemId) => backpackItemConfig[itemId].category)
    .filter((value, index, self) => self.indexOf(value) === index);
  const fields = allCategories.map((category) => {
    const categoryConfig = backpackCategoryConfig[category];
    const categoryItems = itemIds.filter(
      (itemId) => backpackItemConfig[itemId].category === category
    );
    const categoryString = categoryItems
      .map((itemId) => {
        const itemConfig = backpackItemConfig[itemId];
        const whitespaceName = getWhitespace(
          [itemConfig.name],
          shouldShowDescription ? 25 : 20
        )[0];
        return `**${itemConfig.emoji} \`${itemConfig.name}${whitespaceName}${
          flattenedBackpack[itemId]
        }\`**${shouldShowDescription ? `\n${itemConfig.description}\n` : ""}`;
      })
      .join("\n");

    return {
      name: `=== ${categoryConfig.emoji} ${categoryConfig.name} ===`,
      value: categoryString || "No items found!",
      inline: false,
    };
  });

  const embed = new EmbedBuilder();
  embed.setTitle("Your Backpack");
  embed.setColor(0xffffff);
  let description = "";
  // TODO: icon maybe
  if (shouldShowMoney) {
    description += `You have ${formatMoney(money)} Pokédollars.\n`;
  }
  if (shouldShowDreamCards) {
    description += `You have ${formatDreamCards(dreamCards, maxDreamCards)}.\n`;
  }
  if (description !== "") {
    embed.setDescription(description);
  }
  embed.addFields(...fields);

  return embed;
};

/**
 * @param {Trainer} trainer
 * @returns {EmbedBuilder}
 */
const buildLocationsEmbed = (trainer) => {
  // create a string with all locations
  let locationString = "";
  for (const locationId in trainer.locations) {
    const locationLevel = trainer.locations[locationId];
    const location = locationConfig[locationId];

    locationString += `${location.emoji} ${location.name} (Level ${locationLevel})\n`;
  }
  if (locationString === "") {
    locationString = "No locations found!";
  }

  const embed = new EmbedBuilder();
  embed.setTitle(`Trainer ${trainer.user.username}'s Locations`);
  embed.setColor(0xffffff);
  embed.setThumbnail(
    `https://cdn.discordapp.com/avatars/${trainer.userId}/${trainer.user.avatar}.webp`
  );
  embed.setDescription(locationString);
  embed.setFooter({ text: "Use /pokemart to find more locations to buy!" });

  return embed;
};

module.exports = {
  buildTrainerEmbed,
  DEPRECATEDbuildBackpackEmbed,
  buildBackpackEmbed,
  buildLocationsEmbed,
};
