# Yes/No Confirmation Pattern

A common pattern for confirmation dialogs with Yes and No buttons.

```javascript
const {
  useState,
  useCallbackBinding,
  createElement,
} = require("../../deact/deact");
const { ButtonStyle } = require("discord.js");
const Button = require("../../deact/elements/Button");

module.exports = async (ref, { onConfirm, onCancel }) => {
  const [confirmed, setConfirmed] = useState(null, ref);

  const confirmKey = useCallbackBinding((_, data) => {
    if (data.action === "yes") {
      setConfirmed(true);
      onConfirm?.();
    } else {
      setConfirmed(false);
      onCancel?.();
    }
  }, ref);

  return {
    components: [
      [
        createElement(Button, {
          emoji: "✅",
          label: "Yes",
          style: ButtonStyle.Success,
          callbackBindingKey: confirmKey,
          data: { action: "yes" },
        }),
        createElement(Button, {
          emoji: "✖️",
          label: "No",
          style: ButtonStyle.Danger,
          callbackBindingKey: confirmKey,
          data: { action: "no" },
        }),
      ],
    ],
  };
};
```

Key points:

- Single callback handles both buttons using `data.action`
- Use `ButtonStyle.Success` for Yes, `ButtonStyle.Danger` for No
- Track confirmation state with `useState`
