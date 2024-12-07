const {
  useState,
  createElement,
  useCallbackBinding,
} = require("../deact/deact");
const ScrollButtons = require("../elements/foundation/ScrollButtons");

/**
 * @template T
 * @param {object} param0
 * @param {T[]} param0.allItems
 * @param {number=} param0.pageSize
 * @param {number=} param0.initialPage
 * @param {CallbackBindingOptions=} param0.callbackOptions
 * @param {DeactElement} ref
 * @returns {{
 *  page: number,
 *  setPage: (page: number) => void,
 *  items: T[],
 *  element: CreateElementResult,
 * }}
 */
module.exports = (
  { allItems, pageSize = 10, initialPage = 1, callbackOptions = {} },
  ref
) => {
  const minPage = 1;
  const maxPage = Math.ceil(allItems.length / pageSize);
  const [page, setPage] = useState(initialPage, ref);
  const pageClamped = Math.min(Math.max(page, minPage), maxPage);

  const items = allItems.slice((page - 1) * pageSize, page * pageSize);

  const prevActionBindng = useCallbackBinding(
    () => {
      setPage(pageClamped - 1);
    },
    ref,
    callbackOptions
  );
  const nextActionBindng = useCallbackBinding(
    () => {
      setPage(pageClamped + 1);
    },
    ref,
    callbackOptions
  );

  const ScrollButtonsElement = createElement(ScrollButtons, {
    onPrevPressedKey: prevActionBindng,
    onNextPressedKey: nextActionBindng,
    isPrevDisabled: pageClamped === 1,
    isNextDisabled: pageClamped === maxPage,
  });

  return {
    page: pageClamped,
    setPage,
    items,
    element: ScrollButtonsElement,
  };
};
