const { useEffect } = require("../deact/deact");
const usePagination = require("./usePagination");
const useSelection = require("./useSelection");

/**
 * @template {string | number} T
 * @param {Omit<Parameters<typeof usePagination<T>>[0] & Parameters<typeof useSelection<T>>[0] & {
 *  paginationCallbackOptions?: CallbackBindingOptions,
 *  selectionCallbackOptions?: CallbackBindingOptions,
 * }, "items">} options
 * @param {DeactElement} ref
 * @returns {ReturnType<typeof usePagination<T>> & {
 *  currentItem: T?,
 *  setItem: (item: T?) => void,
 *  selectMenuElement: CreateElementResult,
 * }}
 */
module.exports = (options, ref) => {
  const pagination = usePagination(
    {
      ...options,
      callbackOptions: options.paginationCallbackOptions,
    },
    ref
  );
  const selection = useSelection(
    {
      ...options,
      items: pagination.items,
      callbackOptions: options.selectionCallbackOptions,
    },
    ref
  );

  useEffect(
    () => {
      const index = options.allItems.indexOf(selection.currentItem);
      if (index !== -1) {
        pagination.setPage(Math.ceil((index + 1) / options.pageSize));
      }
    },
    [selection.currentItem, pagination.setPage],
    ref
  );

  return {
    ...pagination,
    ...selection,
  };
};
