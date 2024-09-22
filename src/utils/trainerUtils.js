/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * trainerUtils.js the lowest level of trainer code used by trainer.js
 */
const {
  backpackCategories,
  backpackItemConfig,
} = require("../config/backpackConfig");
const { getOrSetDefault, formatMoney } = require("./utils");

const getPokeballsString = (trainer) => {
  let pokeballsString = "";
  for (const item in trainer.backpack[backpackCategories.POKEBALLS]) {
    pokeballsString += `\n${backpackItemConfig[item].emoji} ${
      trainer.backpack[backpackCategories.POKEBALLS][item]
    }x ${backpackItemConfig[item].name}`;
  }
  return pokeballsString;
};

const getBackpackItemsString = (trainer) => {
  let backpackItemsString = "";
  for (const category in trainer.backpack) {
    for (const item in trainer.backpack[category]) {
      backpackItemsString += `\n${backpackItemConfig[item].emoji} ${trainer.backpack[category][item]}x ${backpackItemConfig[item].name}`;
    }
  }
  return backpackItemsString;
};

const getRewardsString = (rewards, received = true) => {
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

const flattenRewards = (rewards) => {
  const flattenedRewards = {
    ...rewards,
  };
  if (rewards.backpack) {
    flattenedRewards.backpack = flattenCategories(rewards.backpack);
  }
  return flattenedRewards;
};

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

const getItems = (trainer, itemId) => {
  const { category } = backpackItemConfig[itemId];
  const items = getOrSetDefault(trainer.backpack, category, {});
  return getOrSetDefault(items, itemId, 0);
};

const setItems = (trainer, itemId, quantity) => {
  const { category } = backpackItemConfig[itemId];
  const items = getOrSetDefault(trainer.backpack, category, {});
  items[itemId] = quantity;
};

const addItems = (trainer, itemId, quantity = 1) => {
  const { category } = backpackItemConfig[itemId];
  const items = getOrSetDefault(trainer.backpack, category, {});
  items[itemId] = getOrSetDefault(items, itemId, 0) + quantity;
};

const removeItems = (trainer, itemId, quantity = 1) => {
  const { category } = backpackItemConfig[itemId];
  const items = getOrSetDefault(trainer.backpack, category, {});
  items[itemId] = getOrSetDefault(items, itemId, 0) - quantity;
};

const getFullUsername = (user) => {
  const discriminator =
    user.discriminator === "0" || user.discriminator === "0000"
      ? ""
      : `#${user.discriminator}`;
  return `${user.username}${discriminator}`;
};

module.exports = {
  getPokeballsString,
  getBackpackItemsString,
  getRewardsString,
  flattenCategories,
  flattenRewards,
  addRewards,
  getItems,
  setItems,
  addItems,
  removeItems,
  getFullUsername,
};
