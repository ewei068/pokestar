const { createElement, useMemo } = require("../../deact/deact");
const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const { craftableItemConfig } = require("../../config/backpackConfig");
const useTrainer = require("../../hooks/useTrainer");
const { buildCraftListEmbed } = require("../../embeds/shopEmbeds");
const { flattenCategories } = require("../../utils/trainerUtils");
const CraftItem = require("./CraftItem");
const useInfoToggle = require("../../hooks/useInfoToggle");

const PAGE_SIZE = 10;
const PAGE_SIZE_WITH_INFO = 7;
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
  const { trainer, err, refreshTrainer } = await useTrainer(user, ref);
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

  const { isToggled: showDescription, toggleButton: toggleInfoButton } =
    useInfoToggle({}, ref);

  const {
    items: itemIds,
    currentItem: itemId,
    setItem: setItemId,
    scrollButtonsElement,
    selectMenuElement,
  } = usePaginationAndSelection(
    {
      allItems: allIds,
      pageSize: showDescription ? PAGE_SIZE_WITH_INFO : PAGE_SIZE,
      initialPage,
      selectionPlaceholder: "Select an Item to craft",
      itemConfig: craftableItemConfig,
      showId: false,
      selectionCallbackOptions: { defer: false },
      paginationCallbackOptions: { defer: false },
    },
    ref
  );

  if (itemId) {
    return {
      elements: [
        createElement(CraftItem, {
          trainer,
          itemId,
          refreshTrainer,
          setItemId,
        }),
      ],
    };
  }
  return {
    elements: [
      {
        content: "",
        embeds: [
          buildCraftListEmbed(itemIds, flattenCategories(trainer.backpack), {
            showDescription,
          }),
        ],
      },
    ],
    components: [[scrollButtonsElement, toggleInfoButton], selectMenuElement],
  };
};

module.exports = CraftList;
