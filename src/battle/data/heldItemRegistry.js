const { logger } = require("../../log");

const allHeldItems = {};

/**
 * @param {Record<HeldItemIdEnum, HeldItem<any>>} heldItems
 */
const registerHeldItems = (heldItems) => {
  let heldItemsRegistered = 0;
  Object.entries(heldItems).forEach(([heldItemId, heldItem]) => {
    allHeldItems[heldItemId] = heldItem;
    heldItemsRegistered += 1;
  });
  logger.info(`Registered ${heldItemsRegistered} held items.`);
};

/**
 * @template {HeldItemIdEnum} K
 * @param {K} heldItemId
 * @returns {K extends keyof RegisteredHeldItems ? RegisteredHeldItems[K] : HeldItem<any>?}
 */
const getHeldItem = (heldItemId) =>
  // @ts-ignore
  allHeldItems[heldItemId];

/**
 * @param {object} param0
 * @param {Record<string, any>=} param0.fieldFilter
 * @param {HeldItemTag=} param0.tagFilter
 * @param {Function=} param0.customFilter
 * @returns {PartialRecord<HeldItemIdEnum, HeldItem<any>>}
 */
const getHeldItems = ({ fieldFilter, tagFilter, customFilter }) => {
  if (customFilter) {
    return Object.entries(allHeldItems).reduce(
      (acc, [heldItemId, heldItem]) => {
        if (customFilter(heldItem)) {
          acc[heldItemId] = heldItem;
        }
        return acc;
      },
      {}
    );
  }

  if (tagFilter) {
    return Object.entries(allHeldItems).reduce(
      (acc, [heldItemId, heldItem]) => {
        if (heldItem.tags.includes(tagFilter)) {
          acc[heldItemId] = heldItem;
        }
        return acc;
      },
      {}
    );
  }

  if (fieldFilter) {
    return Object.entries(allHeldItems).reduce(
      (acc, [heldItemId, heldItem]) => {
        for (const [field, value] of Object.entries(fieldFilter)) {
          if (heldItem[field] !== value) {
            return acc;
          }
        }
        acc[heldItemId] = heldItem;
        return acc;
      },
      {}
    );
  }

  return {
    ...allHeldItems,
  };
};

/**
 * @param {object} param0
 * @param {Record<string, any>=} param0.fieldFilter
 * @param {Function=} param0.customFilter
 * @returns {HeldItemIdEnum[]}
 */
const getHeldItemIds = ({ fieldFilter, customFilter }) => {
  const heldItems = getHeldItems({ fieldFilter, customFilter });
  // @ts-ignore
  return Object.keys(heldItems);
};

module.exports = {
  registerHeldItems,
  getHeldItem,
  getHeldItems,
  getHeldItemIds,
};
