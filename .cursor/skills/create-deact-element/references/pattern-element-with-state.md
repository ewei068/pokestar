# Element with State

An element that manages internal state and updates on user interaction.

```javascript
const {
  useState,
  useCallbackBinding,
  createElement,
} = require("../../deact/deact");
const { buildMyEmbed } = require("../../embeds/myEmbeds");
const Button = require("../../deact/elements/Button");

module.exports = async (ref, { initialValue }) => {
  const [count, setCount] = useState(initialValue, ref);

  const incrementKey = useCallbackBinding(() => {
    setCount((c) => c + 1);
  }, ref);

  return {
    embeds: [buildMyEmbed(count)],
    components: [
      [
        createElement(Button, {
          label: `Count: ${count}`,
          callbackBindingKey: incrementKey,
        }),
      ],
    ],
  };
};
```

See `use-deact-hook` skill for hook details and `deact-component-callback` skill for callback patterns.
