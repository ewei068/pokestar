const { backpackItemConfig } = require("../config/backpackConfig");

/**
 * @param {BackpackItemEnum} itemId
 * @param {number} quantity
 * @returns {string}
 */
const formatItemQuantity = (itemId, quantity) =>
  `${backpackItemConfig[itemId].emoji} ${quantity}x ${backpackItemConfig[itemId].name}`;

/**
 * @param {BackpackItemEnum} itemId
 * @param {Backpack} backpack
 * @returns {string}
 */
const formatItemQuantityFromBackpack = (itemId, backpack) => {
  const { category } = backpackItemConfig[itemId];
  const quantity = backpack[category][itemId];
  return formatItemQuantity(itemId, quantity);
};

module.exports = {
  formatItemQuantity,
  formatItemQuantityFromBackpack,
};
