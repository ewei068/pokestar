const {
  useState,
  createElement,
  useCallbackBinding,
} = require("../deact/deact");
const Fragment = require("../deact/elements/Fragement");
const IdConfigSelectMenu = require("../elements/foundation/IdConfigSelectMenu");

/**
 * @template {string | number} T
 * @param {object} param0
 * @param {T[]} param0.items
 * @param {T=} param0.initialItem
 * @param {string=} param0.selectionPlaceholder
 * @param {boolean=} param0.useCurrentItemDefault
 * @param {PartialRecord<T, any>} param0.itemConfig
 * @param {boolean=} param0.showId
 * @param {CallbackBindingOptions=} param0.callbackOptions
 * @param {DeactElement} ref
 * @returns {{
 *  currentItem: T?,
 *  setItem: (item: T?) => void,
 *  selectMenuElement: CreateElementResult,
 * }}
 */
module.exports = (
  {
    items,
    initialItem,
    selectionPlaceholder = "Select an item",
    useCurrentItemDefault = false,
    itemConfig,
    showId = true,
    callbackOptions = {},
  },
  ref
) => {
  const [currentItem, setItem] = useState(initialItem, ref);

  const onSelectKey = useCallbackBinding(
    (interaction) => {
      // @ts-ignore ts is stupid
      const id = interaction?.values?.[0];
      setItem(id);
    },
    ref,
    callbackOptions
  );

  const selectMenuElement = items.length
    ? createElement(IdConfigSelectMenu, {
        ids: items,
        placeholder: selectionPlaceholder,
        config: itemConfig,
        callbackBindingKey: onSelectKey,
        showId,
        defaultId: useCurrentItemDefault ? currentItem : undefined,
      })
    : createElement(Fragment, {});

  return {
    currentItem,
    setItem,
    selectMenuElement,
  };
};
