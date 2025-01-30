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
 * @returns {string}
 */
const getBackpackItemsString = (trainer) => {
  let backpackItemsString = "";
  for (const category in trainer.backpack) {
    for (const item in trainer.backpack[category]) {
      backpackItemsString += `\n${backpackItemConfig[item].emoji} ${trainer.backpack[category][item]}x ${backpackItemConfig[item].name}`;
    }
  }
  return backpackItemsString;
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
 * @returns {Rewards}
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
  items[itemId] = getOrSetDefault(items, itemId, 0) - quantity;
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

module.exports = {
  getPokeballsString,
  getBackpackItemsString,
  getFlattenedRewardsString,
  getRewardsString,
  flattenCategories,
  flattenRewards,
  addRewards,
  getItems,
  setItems,
  addItems,
  removeItems,
  getFullUsername,
  getUserSelectedDevice,
};
