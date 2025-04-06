/* eslint-disable no-param-reassign */
/**
 * @file
 * @author Elvis Wei
 *
 * trainerUtils.js the lowest level of trainer code used by trainer.js
 */
const {
  backpackCategories,
  backpackItemConfig,
} = require("../config/backpackConfig");
const { emojis } = require("../enums/emojis");
const { formatItemQuantity } = require("./itemUtils");
const { getOrSetDefault, formatMoney } = require("./utils");

/**
 * @param {Trainer} trainer
 * @returns {string}
 */
const getPokeballsString = (trainer) => {
  let pokeballsString = "";
  for (const item in trainer.backpack[backpackCategories.POKEBALLS]) {
    pokeballsString += `\n${backpackItemConfig[item].emoji} ${
      trainer.backpack[backpackCategories.POKEBALLS][item]
    }x ${backpackItemConfig[item].name}`;
  }
  return pokeballsString;
};
/**
 * @param {Trainer} trainer
 * @param {BackpackItemEnum[]=} itemIds
 * @returns {string}
 */
const getBackpackItemsString = (trainer, itemIds = undefined) => {
  let backpackItemsString = "";
  for (const category in trainer.backpack) {
    for (const item in trainer.backpack[category]) {
      // @ts-ignore
      if (itemIds && !itemIds.includes(item)) {
        continue;
      }
      backpackItemsString += `\n${backpackItemConfig[item].emoji} ${trainer.backpack[category][item]}x ${backpackItemConfig[item].name}`;
    }
  }
  return backpackItemsString;
};

/**
 * @param {Cost} cost
 * @returns {string}
 */
const getCompactCostString = (cost) => {
  const stringParts = [];
  if (cost.money) {
    stringParts.push(formatMoney(cost.money));
  }
  if (cost.backpack) {
    for (const categoryId in cost.backpack) {
      for (const itemId in cost.backpack[categoryId]) {
        stringParts.push(
          `${backpackItemConfig[itemId].emoji} x${cost.backpack[categoryId][itemId]}`
        );
      }
    }
  }
  return stringParts.join(" • ");
};

/**
 *
 * @param {FlattenedRewards} rewards
 * @param {boolean=} received
 * @returns {string}
 */
const getFlattenedRewardsString = (rewards, received = true) => {
  let rewardsString = received ? "**You received:**" : "";
  if (rewards.money) {
    rewardsString += `\n${formatMoney(rewards.money)}`;
  }
  if (rewards.backpack) {
    // console.log(rewards.backpack)
    for (const itemId in rewards.backpack) {
      rewardsString += `\n${backpackItemConfig[itemId].emoji} ${rewards.backpack[itemId]}x ${backpackItemConfig[itemId].name}`;
    }
  }
  return rewardsString;
};

/**
 * @param {Backpack} backpack
 * @returns {FlattenedBackpack}
 */
const flattenCategories = (backpack) => {
  const flattenedBackpack = {};
  for (const categoryId in backpack) {
    for (const itemId in backpack[categoryId]) {
      flattenedBackpack[itemId] =
        getOrSetDefault(flattenedBackpack, itemId, 0) +
        backpack[categoryId][itemId];
    }
  }
  return flattenedBackpack;
};

/**
 *
 * @param {Rewards} rewards
 * @returns {FlattenedRewards}
 */
const flattenRewards = (rewards) => {
  const flattenedRewards = {
    ...rewards,
  };
  if (rewards.backpack) {
    // @ts-ignore
    flattenedRewards.backpack = flattenCategories(rewards.backpack);
  }
  // @ts-ignore
  return flattenedRewards;
};

/**
 * @param {Rewards} rewards
 * @param {boolean=} received
 * @returns {string}
 */
const getRewardsString = (rewards, received = true) => {
  const flattenedRewards = flattenRewards(rewards);
  return getFlattenedRewardsString(flattenedRewards, received);
};

/**
 *
 * @param {Trainer} trainer
 * @param {Rewards} rewards
 * @param {any} accumulator
 * @returns {FlattenedRewards}
 */
const addRewards = (trainer, rewards, accumulator = {}) => {
  if (rewards.money) {
    accumulator.money = (accumulator.money || 0) + rewards.money;
    // eslint-disable-next-line no-param-reassign
    trainer.money += rewards.money;
  }
  if (rewards.backpack) {
    const backpack = getOrSetDefault(accumulator, "backpack", {});
    for (const categoryId in rewards.backpack) {
      const trainerBackpackCategory = getOrSetDefault(
        trainer.backpack,
        categoryId,
        {}
      );
      for (const itemId in rewards.backpack[categoryId]) {
        backpack[itemId] =
          getOrSetDefault(backpack, itemId, 0) +
          rewards.backpack[categoryId][itemId];
        trainerBackpackCategory[itemId] =
          getOrSetDefault(trainerBackpackCategory, itemId, 0) +
          rewards.backpack[categoryId][itemId];
      }
    }
  }

  return accumulator;
};

/**
 * @param {Trainer} trainer
 * @param {BackpackItemEnum} itemId
 * @returns {number}
 */
const getItems = (trainer, itemId) => {
  const { category } = backpackItemConfig[itemId];
  const items = getOrSetDefault(trainer.backpack, category, {});
  return getOrSetDefault(items, itemId, 0);
};

/**
 * @param {Trainer} trainer
 * @param {BackpackItemEnum} itemId
 * @param {number} quantity
 */
const setItems = (trainer, itemId, quantity) => {
  const { category } = backpackItemConfig[itemId];
  const items = getOrSetDefault(trainer.backpack, category, {});
  items[itemId] = quantity;
};

/**
 * @param {Trainer} trainer
 * @param {BackpackItemEnum} itemId
 * @param {number} quantity
 */
const addItems = (trainer, itemId, quantity = 1) => {
  const { category } = backpackItemConfig[itemId];
  const items = getOrSetDefault(trainer.backpack, category, {});
  items[itemId] = getOrSetDefault(items, itemId, 0) + quantity;
};

/**
 * @param {Trainer} trainer
 * @param {BackpackItemEnum} itemId
 * @param {number} quantity
 */
const removeItems = (trainer, itemId, quantity = 1) => {
  const { category } = backpackItemConfig[itemId];
  const items = getOrSetDefault(trainer.backpack, category, {});
  items[itemId] = Math.max(getOrSetDefault(items, itemId, 0) - quantity, 0);
};

/**
 * @param {Trainer} trainer
 * @param {number} amount
 */
const removeMoney = (trainer, amount) => {
  trainer.money = Math.max(trainer.money - amount, 0);
};

/**
 * @param {Trainer} trainer
 * @param {Cost} cost
 * @param {object} param2
 * @param {number=} param2.quantity
 */
const removeCost = (trainer, cost, { quantity = 1 } = {}) => {
  if (cost.money) {
    removeMoney(trainer, cost.money * quantity);
  }
  if (cost.backpack) {
    for (const categoryId in cost.backpack) {
      for (const itemId in cost.backpack[categoryId]) {
        removeItems(
          trainer,
          // @ts-ignore
          itemId,
          cost.backpack[categoryId][itemId] * quantity
        );
      }
    }
  }
};

/**
 * @param {Cost} cost
 * @param {Trainer=} trainer
 */
const getCostString = (cost, trainer) => {
  let costString = "";
  if (cost.money) {
    costString += `${formatMoney(cost.money)}`;
    if (trainer) {
      costString += ` (Owned: ${formatMoney(trainer.money)})`;
    }
    costString += "\n";
  }
  if (cost.backpack) {
    for (const category of Object.values(cost.backpack)) {
      for (const [itemId, quantity] of Object.entries(category)) {
        costString += `${formatItemQuantity(
          // @ts-ignore
          itemId,
          quantity
        )}`;
        if (trainer) {
          // @ts-ignore
          costString += ` (Owned: ${getItems(trainer, itemId)})`;
        }
        costString += "\n";
      }
    }
  }
  return costString;
};

/**
 * @param {DiscordUser} user
 * @returns {string}
 */
const getFullUsername = (user) => {
  const discriminator =
    user.discriminator === "0" || user.discriminator === "0000"
      ? ""
      : `#${user.discriminator}`;
  return `${user.username}${discriminator}`;
};

/**
 * @param {DiscordUser} _user
 * @param {UserSettings} userSettings
 * @returns {"mobile" | "desktop"}
 */
const getUserSelectedDevice = (_user, userSettings) =>
  userSettings?.deviceType || "desktop";

/**
 * @param {Trainer} trainer
 * @returns {number}
 */
const getMaxDreamCards = (trainer) => 100 + trainer.level;

/**
 * @param {Trainer} trainer
 * @returns {string}
 */
const formatDreamCardsForTrainer = (trainer) =>
  `${emojis.DREAM_CARD} ${trainer.dreamCards}/${getMaxDreamCards(
    trainer
  )} Dream Cards`;

module.exports = {
  getPokeballsString,
  getBackpackItemsString,
  getFlattenedRewardsString,
  getRewardsString,
  getCompactCostString,
  flattenCategories,
  flattenRewards,
  addRewards,
  removeMoney,
  removeCost,
  getCostString,
  getItems,
  setItems,
  addItems,
  removeItems,
  getFullUsername,
  getUserSelectedDevice,
  getMaxDreamCards,
  formatDreamCardsForTrainer,
};
