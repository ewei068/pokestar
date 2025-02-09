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
    initialPage = 1,
    pageSize = 15,
    onItemsChanged = () => {},
  }
) => {
  const backpackItems =
    (backpackCategory !== undefined
      ? backpack[backpackCategory]
      : flattenCategories(backpack)) || {};
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
      buildBackpackEmbed(itemIds, backpackItems, { money, shouldShowMoney }),
    ],
    components: [scrollButtonsElement],
  };
};

module.exports = BackpackList;
