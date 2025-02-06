const { createElement, useMemo } = require("../../deact/deact");
const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const { craftableItemConfig } = require("../../config/backpackConfig");
const useTrainer = require("../../hooks/useTrainer");
const { buildCraftListEmbed } = require("../../embeds/shopEmbeds");
const { flattenCategories } = require("../../utils/trainerUtils");

const PAGE_SIZE = 10;
const allCraftableItemIds = /** @type {CraftableItemEnum[]} */ (
  Object.keys(craftableItemConfig)
);

/**
 *
 * @param {import("../../deact/DeactElement").DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @param {number=} param1.initialPage
 * @param {string=} param1.searchString
 * @returns {Promise<any>}
 */
const CraftList = async (ref, { user, initialPage = 1, searchString }) => {
  const { trainer, err } = await useTrainer(user, ref);
  if (err) {
    return {
      err,
    };
  }

  const allIds = useMemo(
    () => {
      if (searchString) {
        return allCraftableItemIds.filter((id) =>
          craftableItemConfig[id].name.toLowerCase().includes(searchString)
        );
      }
      return allCraftableItemIds;
    },
    [searchString],
    ref
  );
  if (allIds.length === 0) {
    return {
      err: "No items found. Try a different search term!",
    };
  }

  const {
    page,
    items: itemIds,
    currentItem: itemId,
    scrollButtonsElement,
    selectMenuElement,
  } = usePaginationAndSelection(
    {
      allItems: allIds,
      pageSize: PAGE_SIZE,
      initialPage,
      selectionPlaceholder: "Select an Item to craft",
      itemConfig: craftableItemConfig,
      selectionCallbackOptions: { defer: false },
      paginationCallbackOptions: { defer: false },
    },
    ref
  );

  return {
    elements: [
      {
        content: "",
        embeds: [
          buildCraftListEmbed(itemIds, flattenCategories(trainer.backpack)),
        ],
      },
    ],
    components: [scrollButtonsElement, selectMenuElement],
  };
};

module.exports = CraftList;
