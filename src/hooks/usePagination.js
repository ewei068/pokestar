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
 *  scrollButtonsElement: CreateElementResult,
 * }}
 */
module.exports = (
  { allItems, pageSize = 10, initialPage = 1, callbackOptions = {} },
  ref
) => {
  const minPage = 1;
  const maxPage = Math.ceil(allItems.length / pageSize);
  const [page, setPage] = useState(initialPage, ref);
  const pageClamped = Math.min(Math.max(page, minPage));

  const items = allItems.slice(
    (pageClamped - 1) * pageSize,
    pageClamped * pageSize
  );

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

  const scrollButtonsElement = createElement(ScrollButtons, {
    onPrevPressedKey: prevActionBindng,
    onNextPressedKey: nextActionBindng,
    isPrevDisabled: pageClamped <= 1,
    isNextDisabled: pageClamped >= maxPage,
  });

  return {
    page: pageClamped,
    setPage,
    items,
    scrollButtonsElement,
  };
};
