const { useMemo, useEffect } = require("../../deact/deact");
const { flattenCategories } = require("../../utils/trainerUtils");
const usePagination = require("../../hooks/usePagination");
const { buildBackpackEmbed } = require("../../embeds/trainerEmbeds");
const useInfoToggle = require("../../hooks/useInfoToggle");

/**
 * @param {DeactElement} ref
 * @param {object} param0
 * @param {BackpackCategoryEnum=} param0.backpackCategory
 * @param {Backpack} param0.backpack
 * @param {number=} param0.money
 * @param {boolean=} param0.shouldShowMoney
 * @param {number=} param0.initialPage
 * @param {number=} param0.pageSize
 * @param {number=} param0.pageSizeWithInfo
 * @param {((itemIds: BackpackItemEnum[]) => any)=} param0.onItemsChanged
 * @param {number=} param0.dreamCards
 * @param {boolean=} param0.shouldShowDreamCards
 * @param {number=} param0.maxDreamCards
 */
const BackpackList = async (
  ref,
  {
    backpackCategory,
    backpack,
    money,
    shouldShowMoney = true,
    dreamCards,
    maxDreamCards,
    shouldShowDreamCards = false,
    initialPage = 1,
    pageSize = 15,
    pageSizeWithInfo = 4,
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

  const { isToggled: shouldShowDescription, toggleButton: toggleInfoButton } =
    useInfoToggle({}, ref);

  const { items: itemIds, scrollButtonsElement } = usePagination(
    {
      allItems,
      pageSize: shouldShowDescription ? pageSizeWithInfo : pageSize,
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
        dreamCards,
        maxDreamCards,
        shouldShowDreamCards,
      }),
    ],
    components: [[scrollButtonsElement, toggleInfoButton]],
  };
};

module.exports = BackpackList;
