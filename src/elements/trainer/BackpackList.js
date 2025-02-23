const { useMemo, useEffect } = require("../../deact/deact");
const { flattenCategories } = require("../../utils/trainerUtils");
const usePagination = require("../../hooks/usePagination");
const { buildBackpackEmbed } = require("../../embeds/trainerEmbeds");

/**
 * @param {DeactElement} ref
 * @param {object} param0
 * @param {BackpackCategoryEnum=} param0.backpackCategory
 * @param {Backpack} param0.backpack
 * @param {number=} param0.money
 * @param {boolean=} param0.shouldShowMoney
 * @param {boolean=} param0.shouldShowDescription
 * @param {number=} param0.initialPage
 * @param {number=} param0.pageSize
 * @param {((itemIds: BackpackItemEnum[]) => any)=} param0.onItemsChanged
 */
const BackpackList = async (
  ref,
  {
    backpackCategory,
    backpack,
    money,
    shouldShowMoney = true,
    shouldShowDescription = false,
    initialPage = 1,
    pageSize = 15,
    onItemsChanged = () => {},
  }
) => {
  // removes keys that have no value
  const filterBackpack = (backpackToFilter) => {
    const filteredBackpack = {};
    for (const key in backpackToFilter) {
      if (backpackToFilter[key]) {
        filteredBackpack[key] = backpackToFilter[key];
      }
    }
    return filteredBackpack;
  };

  const backpackItems = filterBackpack(
    (backpackCategory !== undefined
      ? backpack[backpackCategory]
      : flattenCategories(backpack)) || {}
  );
  const allItems = useMemo(
    () => /** @type {BackpackItemEnum[]} */ (Object.keys(backpackItems)),
    [backpack, backpackCategory],
    ref
  );

  const { items: itemIds, scrollButtonsElement } = usePagination(
    {
      allItems,
      pageSize,
      initialPage,
      callbackOptions: { defer: false },
    },
    ref
  );
  useEffect(
    () => {
      onItemsChanged(itemIds);
    },
    [itemIds, onItemsChanged],
    ref
  );

  return {
    contents: [""],
    embeds: [
      buildBackpackEmbed(itemIds, backpackItems, {
        money,
        shouldShowMoney,
        shouldShowDescription,
      }),
    ],
    components: [scrollButtonsElement],
  };
};

module.exports = BackpackList;
