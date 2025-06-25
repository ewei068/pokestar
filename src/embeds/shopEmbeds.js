/**
 * @file
 * @author Elvis Wei
 *
 * shopEmbeds.js Creates the embeded options for the shop for user interaction.
 */
const { EmbedBuilder } = require("discord.js");
const { shopCategoryConfig, shopItemConfig } = require("../config/shopConfig");
const { formatMoney, buildBlockQuoteString } = require("../utils/utils");
const { craftableItemConfig } = require("../config/backpackConfig");
const { getItemDisplay } = require("../utils/itemUtils");
const { flattenCategories, getCostString } = require("../utils/trainerUtils");

/**
 * @param {Trainer} trainer
 * @returns {EmbedBuilder}
 */
const buildShopEmbed = (trainer) => {
  let shopString = " ";
  for (const categoryId in shopCategoryConfig) {
    shopString += `**${shopCategoryConfig[categoryId].emoji} ${shopCategoryConfig[categoryId].name}**\n`;
  }

  const embed = new EmbedBuilder();
  embed.setTitle(`Pokemart`);
  embed.setColor(0xffffff);
  embed.setDescription(
    buildBlockQuoteString(
      "Welcome to the Pokemart! Here you can buy items to help you on your journey. Use the Buttons below to navigate the shop."
    )
  );
  embed.addFields({ name: "Categories", value: shopString, inline: true });
  embed.setFooter({
    text: `You have ${formatMoney(trainer.money)} Pokédollars.`,
  });

  return embed;
};

/**
 * @param {Trainer} trainer
 * @param {ShopCategoryEnum} categoryId
 * @returns {EmbedBuilder}
 */
const buildShopCategoryEmbed = (trainer, categoryId) => {
  const categoryData = shopCategoryConfig[categoryId];
  const { items } = categoryData;
  let shopString = " ";
  for (let i = 0; i < items.length; i += 1) {
    const item = shopItemConfig[items[i]];
    if (item.price.length === 1) {
      shopString += `${item.emoji} **#${items[i]} ${
        item.name
      }** - ${formatMoney(item.price[0])}\n`;
    } else {
      // multi-price items
      // TODO: make this better or remove if multi-prices are too many
      shopString += `${item.emoji} **#${items[i]} ${item.name}** - `;
      for (let j = 0; j < item.price.length; j += 1) {
        shopString += `${formatMoney(item.price[j])}`;
        if (j < item.price.length - 1) {
          shopString += "/";
        }
      }
      shopString += "\n";
    }
  }

  const embed = new EmbedBuilder();
  embed.setTitle(`Pokemart - ${shopCategoryConfig[categoryId].name}`);
  embed.setColor(0xffffff);
  embed.setDescription(
    buildBlockQuoteString(
      `${categoryData.description}\n\nSelect an item for more information.`
    )
  );
  embed.addFields({ name: "Items", value: shopString, inline: true });
  embed.setFooter({
    text: `You have ${formatMoney(
      trainer.money
    )} Pokédollars | Use /buy <itemid> <qty?> to buy an item!`,
  });

  return embed;
};

/**
 * @param {Trainer} trainer
 * @param {ShopItemEnum} itemId
 * @returns {EmbedBuilder}
 */
const buildShopItemEmbed = (trainer, itemId) => {
  const itemData = shopItemConfig[itemId];

  let priceString = "";
  if (itemData.price.length === 1) {
    priceString = `${formatMoney(itemData.price[0])}`;
  } else {
    // multi-price items are based on upgrade level (for now)
    for (let i = 0; i < itemData.price.length; i += 1) {
      priceString += `Level ${i + 1}: ${formatMoney(itemData.price[i])}`;
      if (i < itemData.price.length - 1) {
        priceString += "\n";
      }
    }
  }

  const embed = new EmbedBuilder();
  embed.setTitle(`Pokemart - ${itemData.name} (ID: ${itemId})`);
  embed.setColor(0xffffff);
  embed.setDescription(
    buildBlockQuoteString(
      `${itemData.description}\n\nUse \`/buy ${itemId} <qty?>\` to buy this item!`
    )
  );
  embed.addFields(
    { name: "💰 Price", value: priceString, inline: true },
    {
      name: "📅 Daily Limit",
      value: `${itemData.limit || "None"}`,
      inline: true,
    }
  );
  embed.setFooter({
    text: `You have ${formatMoney(
      trainer.money
    )} Pokédollars | Use /buy ${itemId} <qty?> to buy this item!`,
  });

  return embed;
};

/**
 * @param {CraftableItemEnum[]} itemIds
 * @param {FlattenedBackpack} backpack
 * @param {object} options
 * @param {boolean=} options.showDescription
 */
const buildCraftListEmbed = (
  itemIds,
  backpack,
  { showDescription = false } = {}
) => {
  let craftString = "";
  for (const itemId of itemIds) {
    const item = craftableItemConfig[itemId];
    craftString += `${item.emoji} **${item.name}** (Owned: ${
      backpack[itemId] || 0
    })\n`;
    if (showDescription) {
      craftString += `${item.description}\n\n`;
    }
  }

  const embed = new EmbedBuilder();
  embed.setTitle("Crafting");
  embed.setColor(0xffffff);
  embed.setDescription(craftString);
  embed.setFooter({
    text: `Select an item to craft!`,
  });

  return embed;
};

/**
 * @param {Trainer} trainer
 * @param {CraftableItemEnum} itemId
 * @returns {EmbedBuilder}
 */
const buildCraftItemEmbed = (trainer, itemId) => {
  const item = craftableItemConfig[itemId];
  const embed = new EmbedBuilder();
  embed.setTitle(`Crafting - ${getItemDisplay(itemId)}`);
  embed.setColor(0xffffff);
  embed.setDescription(item.description);
  embed.addFields(
    {
      name: "Currently Owned",
      value: `${flattenCategories(trainer.backpack)[itemId] || 0}`,
      inline: true,
    },
    {
      name: "Crafting Cost (One)",
      value: getCostString(item.cost, trainer),
      inline: false,
    }
  );
  embed.setImage("https://poqu-a-doodle.com/img/portfolio/tinkatonsmithy.jpg");

  return embed;
};

module.exports = {
  buildShopEmbed,
  buildShopCategoryEmbed,
  buildShopItemEmbed,
  buildCraftListEmbed,
  buildCraftItemEmbed,
};
