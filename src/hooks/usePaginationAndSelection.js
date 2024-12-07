const {
  useState,
  useEffect,
  createElement,
  useCallbackBinding,
} = require("../deact/deact");
const usePagination = require("./usePagination");
const IdConfigSelectMenu = require("../elements/foundation/IdConfigSelectMenu");

/**
 * @template {string | number} T
 * @param {object} param0
 * @param {T[]} param0.allItems
 * @param {number=} param0.pageSize
 * @param {number=} param0.initialPage
 * @param {T=} param0.initialItem
 * @param {string=} param0.selectionPlaceholder
 * @param {PartialRecord<T, any>} param0.itemConfig
 * @param {CallbackBindingOptions=} param0.paginationCallbackOptions
 * @param {CallbackBindingOptions=} param0.selectionCallbackOptions
 * @param {DeactElement} ref
 * @returns {ReturnType<usePagination> & {
 *  currentItem: T?,
 *  setItem: (item: T?) => void,
 *  selectMenuElement: CreateElementResult,
 * }}
 */
module.exports = (
  {
    allItems,
    pageSize = 10,
    initialPage = 1,
    initialItem,
    selectionPlaceholder = "Select an item",
    itemConfig,
    paginationCallbackOptions = {},
    selectionCallbackOptions = {},
  },
  ref
) => {
  const [currentItem, setItem] = useState(initialItem, ref);
  const pagination = usePagination(
    {
      allItems,
      pageSize,
      initialPage,
      callbackOptions: paginationCallbackOptions,
    },
    ref
  );

  const onSelectKey = useCallbackBinding(
    (interaction) => {
      // @ts-ignore ts is stupid
      const id = interaction?.values?.[0];
      setItem(id);
    },
    ref,
    selectionCallbackOptions
  );

  useEffect(
    () => {
      const index = allItems.indexOf(currentItem);
      if (index !== -1) {
        pagination.setPage(Math.ceil((index + 1) / pageSize));
      }
    },
    [currentItem, pagination.setPage],
    ref
  );

  const selectMenuElement = createElement(IdConfigSelectMenu, {
    ids: pagination.items,
    placeholder: selectionPlaceholder,
    config: itemConfig,
    callbackBindingKey: onSelectKey,
  });

  return {
    ...pagination,
    currentItem,
    setItem,
    selectMenuElement,
  };
};
