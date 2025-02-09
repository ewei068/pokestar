const {
  useState,
  createElement,
  useAwaitedEffect,
} = require("../../deact/deact");
const useSelection = require("../../hooks/useSelection");
const { backpackItemConfig } = require("../../config/backpackConfig");
const BackpackList = require("./BackpackList");

/**
 * @param {DeactElement} ref
 * @param {object} param0
 * @param {BackpackCategoryEnum=} param0.backpackCategory
 * @param {Backpack} param0.backpack
 * @param {number=} param0.money
 * @param {boolean=} param0.shouldShowMoney
 * @param {boolean=} param0.shouldShowDescription
 * @param {number=} param0.initialPage
 * @param {((itemId: BackpackItemEnum) => any)=} param0.onItemSelected
 */
const BackpackListWithSelection = async (
  ref,
  {
    backpackCategory,
    backpack,
    money,
    shouldShowMoney = true,
    shouldShowDescription = false,
    initialPage = 1,
    onItemSelected = () => {},
  }
) => {
  const [items, setItems] = useState([], ref);
  const { currentItem, selectMenuElement } = useSelection(
    {
      items,
      selectionPlaceholder: "Select an item",
      useCurrentItemDefault: true,
      itemConfig: backpackItemConfig,
      showId: false,
      callbackOptions: { defer: false },
    },
    ref
  );
  await useAwaitedEffect(
    async () => {
      if (currentItem) {
        await onItemSelected(currentItem);
      }
    },
    [currentItem, onItemSelected],
    ref
  );

  return {
    elements: [
      createElement(BackpackList, {
        backpackCategory,
        backpack,
        money,
        shouldShowMoney,
        shouldShowDescription,
        initialPage,
        pageSize: 10,
        onItemsChanged: setItems,
      }),
    ],
    components: [selectMenuElement],
  };
};

module.exports = BackpackListWithSelection;
