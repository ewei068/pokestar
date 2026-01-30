# Hook with Callback Options

Pass through callback options (like `defer`) to allow customization by the consuming element.

```javascript
const {
  useState,
  useCallbackBinding,
  createElement,
} = require("../deact/deact");
const StringSelectMenu = require("../deact/elements/StringSelectMenu");

/**
 * @param {object} param0
 * @param {{ label: string, value: string }[]} param0.options
 * @param {CallbackBindingOptions=} param0.callbackOptions
 * @param {DeactElement} ref
 */
const useSelection = ({ options, callbackOptions = {} }, ref) => {
  const [selected, setSelected] = useState(null, ref);

  const selectKey = useCallbackBinding(
    (interaction) => {
      const value = interaction.values[0];
      setSelected(value);
    },
    ref,
    callbackOptions,
  );

  const selectElement = createElement(StringSelectMenu, {
    placeholder: "Select an option",
    options,
    callbackBindingKey: selectKey,
  });

  return {
    selected,
    setSelected,
    selectElement,
  };
};

module.exports = useSelection;
```

Key points:

- Accept `callbackOptions` as a prop
- Pass options through to `useCallbackBinding`
- Allows consumers to control defer behavior
