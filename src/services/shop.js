/* eslint-disable no-param-reassign */
/**
 * @file
 * @author Elvis Wei
 *
 * shop.js runs all base level shop items, logic and interactions.
 */
const {
  shopItems,
  shopItemConfig,
  shopCategories,
  shopCategoryConfig,
} = require("../config/shopConfig");
const { getOrSetDefault, formatMoney } = require("../utils/utils");
const { dailyRewardChances } = require("../config/gachaConfig");
const { drawDiscrete } = require("../utils/gachaUtils");
const { updateDocument } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { logger } = require("../log");
const { locations, locationConfig } = require("../config/locationConfig");

const { getTrainer, updateTrainer, emitTrainerEvent } = require("./trainer");
const { getState } = require("./state");
const {
  buildShopEmbed,
  buildShopCategoryEmbed,
  buildShopItemEmbed,
} = require("../embeds/shopEmbeds");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { eventNames } = require("../config/eventConfig");
const { buildButtonActionRow } = require("../components/buttonActionRow");
const { buildBackButtonRow } = require("../components/backButtonRow");
const {
  getFlattenedRewardsString,
  getPokeballsString,
  addItems,
  getItems,
  removeCost,
} = require("../utils/trainerUtils");
const { craftableItemConfig } = require("../config/backpackConfig");
const { getItemDisplay } = require("../utils/itemUtils");
const { trainerEventEnum } = require("../enums/gameEnums");

// map item id to location id
const itemIdToLocationId = {
  [shopItems.HOME]: locations.HOME,
  [shopItems.RESTAURANT]: locations.RESTAURANT,
  [shopItems.GYM]: locations.GYM,
  [shopItems.DOJO]: locations.DOJO,
  [shopItems.TEMPLE]: locations.TEMPLE,
  [shopItems.SCHOOL]: locations.SCHOOL,
  [shopItems.TRACK]: locations.TRACK,
  [shopItems.BERRY_BUSH]: locations.BERRY_BUSH,
  [shopItems.BERRY_FARM]: locations.BERRY_FARM,
  [shopItems.COMPUTER_LAB]: locations.COMPUTER_LAB,
  [shopItems.ILEX_SHRINE]: locations.ILEX_SHRINE,
};

/**
 *
 * @param {WithId<Trainer>} trainer
 * @param {ShopItemEnum} itemId
 * @param {number} quantity
 * @returns {object}
 */
const canBuyItem = (trainer, itemId, quantity) => {
  getOrSetDefault(trainer.purchasedShopItemsToday, itemId, 0);

  // get item data
  const item = shopItemConfig[itemId];
  if (!item) {
    return { data: null, err: "Item does not exist." };
  }

  if (item.limit) {
    // check if limit has been reached
    if (trainer.purchasedShopItemsToday[itemId] >= item.limit) {
      return {
        data: null,
        err: "You have reached the daily limit for this item.",
      };
    }

    // check if quantity exceeds limit
    if (trainer.purchasedShopItemsToday[itemId] + quantity > item.limit) {
      return {
        data: null,
        err: `You can only purchase ${
          item.limit - trainer.purchasedShopItemsToday[itemId]
        } more of this item today.`,
      };
    }
  }

  let cost = 0;

  // functionality dependent on item
  if (itemId === shopItems.RANDOM_POKEBALL) {
    // check if trainer has enough money
    cost = item.price[0] * quantity;
    if (trainer.money < cost) {
      return { data: null, err: "You do not have enough money." };
    }
  } else if (item.category === shopCategories.LOCATIONS) {
    // if quantity is not 1, return error
    if (quantity !== 1) {
      return {
        data: null,
        err: "You can only purchase one location at a time.",
      };
    }

    const locationId = itemIdToLocationId[itemId];
    const locationData = locationConfig[locationId];

    // check what level location is
    const level = getOrSetDefault(trainer.locations, locationId, 0);
    if (level >= Object.keys(locationData.levelConfig).length) {
      return {
        data: null,
        err: "You have already purchased the maximum level for this location.",
      };
    }

    // check if trainer has enough money
    cost = item.price[level];
    if (trainer.money < cost) {
      return { data: null, err: "You do not have enough money." };
    }
  } else if (item.category === shopCategories.MATERIALS) {
    // check if trainer has enough money
    cost = item.price[0] * quantity;
    if (trainer.money < cost) {
      return { data: null, err: "You do not have enough money." };
    }
  }

  return {
    data: null,
    err: null,
  };
};

/**
 * @param {WithId<Trainer>} trainer
 * @param {ShopItemEnum} itemId
 * @param {number} quantity
 * @returns {Promise<{data: string?, err: string?}>}
 */
const buyItem = async (trainer, itemId, quantity) => {
  getOrSetDefault(trainer.purchasedShopItemsToday, itemId, 0);

  // get item data
  const item = shopItemConfig[itemId];
  if (!item) {
    return { data: null, err: "Item does not exist." };
  }

  if (item.limit) {
    // check if limit has been reached
    if (trainer.purchasedShopItemsToday[itemId] >= item.limit) {
      return {
        data: null,
        err: "You have reached the daily limit for this item.",
      };
    }

    // check if quantity exceeds limit
    if (trainer.purchasedShopItemsToday[itemId] + quantity > item.limit) {
      return {
        data: null,
        err: `You can only purchase ${
          item.limit - trainer.purchasedShopItemsToday[itemId]
        } more of this item today.`,
      };
    }
  }

  let cost = 0;
  let returnString = "";
  let levelPurchased;

  // functionality dependent on item
  if (itemId === shopItems.RANDOM_POKEBALL) {
    // check if trainer has enough money
    cost = item.price[0] * quantity;
    if (trainer.money < cost) {
      return { data: null, err: "You do not have enough money." };
    }

    // purchase item
    trainer.money -= cost;
    trainer.purchasedShopItemsToday[itemId] =
      getOrSetDefault(trainer.purchasedShopItemsToday, itemId, 0) + quantity;

    // roll random pokeballs
    const results = drawDiscrete(dailyRewardChances, quantity);
    const reducedResults = results.reduce((acc, curr) => {
      if (acc[curr] === undefined) {
        acc[curr] = 1;
      } else {
        acc[curr] += 1;
      }
      return acc;
    }, {});

    // add pokeballs to trainer's backpack
    Object.entries(reducedResults).forEach(([key, value]) => {
      addItems(trainer, key, value);
    });

    returnString = `You purchased ${quantity} random pokeballs for ${formatMoney(
      cost
    )}.\n`;
    // build itemized rewards string
    returnString += getFlattenedRewardsString({
      backpack: reducedResults,
    });
    returnString += "\n\n**You now own:**";
    returnString += `\n${formatMoney(trainer.money)}`;
    returnString += getPokeballsString(trainer);
  } else if (item.category === shopCategories.LOCATIONS) {
    // if quantity is not 1, return error
    if (quantity !== 1) {
      return {
        data: null,
        err: "You can only purchase one location at a time.",
      };
    }

    const locationId = itemIdToLocationId[itemId];
    const locationData = locationConfig[locationId];

    // check what level location is
    const level = getOrSetDefault(trainer.locations, locationId, 0);
    if (level >= Object.keys(locationData.levelConfig).length) {
      return {
        data: null,
        err: "You have already purchased the maximum level for this location.",
      };
    }

    // check if trainer has enough money
    cost = item.price[level];
    if (trainer.money < cost) {
      return { data: null, err: "You do not have enough money." };
    }

    // purchase item
    trainer.money -= cost;
    trainer.locations[locationId] = level + 1;

    returnString = `You purchased a level ${level + 1} ${
      locationData.name
    } for ${formatMoney(cost)}. View your locations with \`/locations\`.`;
    levelPurchased = level;
  } else if (item.category === shopCategories.MATERIALS) {
    // check if trainer has enough money
    cost = item.price[0] * quantity;
    if (trainer.money < cost) {
      return { data: null, err: "You do not have enough money." };
    }

    // purchase item
    trainer.money -= cost;
    trainer.purchasedShopItemsToday[itemId] =
      getOrSetDefault(trainer.purchasedShopItemsToday, itemId, 0) + quantity;

    // add item
    addItems(trainer, item.backpackItem, quantity);

    returnString = `You purchased ${quantity} ${item.name}s for ${formatMoney(
      cost
    )}.\n`;
    returnString += `**You now own: ${getItems(trainer, item.backpackItem)} ${
      item.name
    }s.**`;
  }

  // update trainer
  try {
    const res = await updateTrainer(trainer);
    if (res.err) {
      logger.error(
        `Failed to update ${trainer.user.username} after shop purchase.`
      );
      return { data: null, err: "Error shop purchase." };
    }

    if (res.data) {
      await emitTrainerEvent(trainerEventEnum.MADE_PURCHASE, {
        trainer,
        itemId,
        level: levelPurchased,
        quantity,
      });
    }
  } catch (error) {
    logger.error(error);
    return { data: null, err: "Error shop purchase." };
  }

  // return success
  return { data: returnString, err: null };
};

/**
 *
 * @param {object} param0
 * @param {string?=} param0.stateId
 * @param {DiscordUser?=} param0.user
 * @param {string?=} param0.view
 * @param {string?=} param0.option
 * @param {boolean?=} param0.back
 * @returns
 */
const buildShopSend = async ({
  stateId = null,
  user = null,
  view = "shop",
  option = null,
  back = true,
} = {}) => {
  // get state
  const state = getState(stateId);

  // get trainer
  const trainerRes = await getTrainer(user);
  if (trainerRes.err) {
    return { send: null, err: trainerRes.err };
  }
  const trainer = trainerRes.data;

  const send = {
    embeds: [],
    components: [],
  };

  if (view === "shop") {
    // build shop embed
    const embed = buildShopEmbed(trainer);

    const categorySelectRowData = {
      stateId,
      select: "category",
    };
    const categorySelectRow = buildIdConfigSelectRow(
      Object.keys(shopCategoryConfig),
      shopCategoryConfig,
      "Select a category:",
      categorySelectRowData,
      eventNames.SHOP_SELECT
    );

    send.embeds.push(embed);
    send.components.push(categorySelectRow);
  } else if (view === "category") {
    // if select is category, update embed to selected category
    const embed = buildShopCategoryEmbed(trainer, option);
    send.embeds.push(embed);

    const categorySelectRowData = {
      stateId,
      select: "item",
    };
    const categorySelectRow = buildIdConfigSelectRow(
      shopCategoryConfig[option].items,
      shopItemConfig,
      "Select an item:",
      categorySelectRowData,
      eventNames.SHOP_SELECT
    );
    send.components.push(categorySelectRow);
    // get back button
    const backButton = buildBackButtonRow(stateId);
    send.components.push(backButton);
  } else if (view === "item") {
    // if select is item, update embed to selected item
    const embed = buildShopItemEmbed(trainer, option);
    send.embeds.push(embed);

    const isLocation =
      shopItemConfig[option].category === shopCategories.LOCATIONS;
    const locationId = itemIdToLocationId[option];
    const isUpgrade = isLocation && (trainer.locations?.[locationId] ?? 0) > 0;

    const buttonData = {
      stateId,
      itemId: option,
      quantity: 1,
    };
    // create buy button
    const buttonConfigs = [
      {
        label: isUpgrade ? "Upgrade" : "Buy",
        disabled: canBuyItem(trainer, option, 1).err !== null,
        data: buttonData,
        emoji: shopItemConfig[option].emoji,
      },
    ];
    // get max quantity trainer can buy, up to 10
    let maxQuantity = 0;
    for (let i = 1; i <= 10; i += 1) {
      if (canBuyItem(trainer, option, i).err !== null) {
        break;
      }
      maxQuantity = i;
    }
    if (maxQuantity > 2) {
      buttonConfigs.push({
        label: `Buy ${maxQuantity}`,
        disabled: false,
        data: { ...buttonData, quantity: maxQuantity },
        emoji: shopItemConfig[option].emoji,
      });
    }
    const buyButton = buildButtonActionRow(buttonConfigs, eventNames.SHOP_BUY);
    send.components.push(buyButton);
    // get back button
    const backButton = buildBackButtonRow(stateId);
    send.components.push(backButton);
  }

  if (back) {
    state.messageStack.push({
      execute: buildShopSend,
      args: {
        stateId,
        user,
        view,
        option,
        back: false,
      },
    });
  }

  return { send, err: null };
};

/**
 * @param {Trainer} trainer
 * @param {CraftableItemEnum} itemId
 * @param {number=} quantity
 */
const canCraftItem = (trainer, itemId, quantity = 1) => {
  const item = craftableItemConfig[itemId];
  if (!item) {
    return { data: null, err: "Item does not exist." };
  }

  const { cost } = item;
  const { backpack } = trainer;
  if (cost.money) {
    if (trainer.money < cost.money * quantity) {
      return { data: null, err: "You do not have enough money." };
    }
  }
  if (cost.backpack) {
    for (const [categoryId, category] of Object.entries(cost.backpack)) {
      for (const [costItemId, itemCost] of Object.entries(category)) {
        if (backpack[categoryId]?.[costItemId] < itemCost * quantity) {
          return {
            data: null,
            // @ts-ignore
            err: `You do not have enough ${getItemDisplay(costItemId)}.`,
          };
        }
      }
    }
  }

  return { data: null, err: null };
};

/**
 * @param {CompactUser} user
 * @param {CraftableItemEnum} itemId
 * @param {number=} quantity
 */
const craftItem = async (user, itemId, quantity = 1) => {
  const item = craftableItemConfig[itemId];
  if (!item) {
    return { data: null, err: "Item does not exist." };
  }

  const { data: trainer, err: trainerErr } = await getTrainer(user);
  if (trainerErr) {
    return { data: null, err: trainerErr };
  }

  const { err: canCraftErr } = canCraftItem(trainer, itemId, quantity);
  if (canCraftErr) {
    return { data: null, err: canCraftErr };
  }

  removeCost(trainer, item.cost, {
    quantity,
  });
  addItems(trainer, itemId, quantity);

  return await updateTrainer(trainer);
};

module.exports = {
  canBuyItem,
  buyItem,
  buildShopSend,
  canCraftItem,
  craftItem,
};
