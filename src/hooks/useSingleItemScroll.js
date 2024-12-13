const {
  useState,
  createElement,
  useCallbackBinding,
  useMemo,
} = require("../deact/deact");
const ScrollButtons = require("../elements/foundation/ScrollButtons");

/**
 * @template T
 * @param {object} param0
 * @param {T[]} param0.allItems
 * @param {T=} param0.initialItem
 * @param {T=} param0.itemOverride
 * @param {(item: T) => void} param0.setItemOverride
 * @param {CallbackBindingOptions=} param0.callbackOptions
 * @param {DeactElement} ref
 * @returns {{
 *  page: number,
 *  item: T,
 *  scrollButtonsElement: CreateElementResult,
 * }}
 */
module.exports = (
  {
    allItems,
    initialItem,
    itemOverride,
    setItemOverride,
    callbackOptions = {},
  },
  ref
) => {
  const [itemFromState, setItemInState] = useState(initialItem, ref);
  const item = itemOverride ?? itemFromState;
  const setItem = setItemOverride ?? setItemInState;

  let index = useMemo(() => allItems.indexOf(item), [item, allItems], ref);
  index = Math.max(0, index);

  const prevActionBindng = useCallbackBinding(
    () => {
      setItem(allItems[index - 1]);
    },
    ref,
    callbackOptions
  );
  const nextActionBindng = useCallbackBinding(
    () => {
      setItem(allItems[index + 1]);
    },
    ref,
    callbackOptions
  );

  const scrollButtonsElement = createElement(ScrollButtons, {
    onPrevPressedKey: prevActionBindng,
    onNextPressedKey: nextActionBindng,
    isPrevDisabled: index <= 0,
    isNextDisabled: index >= allItems.length - 1,
  });

  return {
    page: index + 1,
    item,
    scrollButtonsElement,
  };
};
