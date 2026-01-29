# Pagination Pattern

A common pattern for prev/next navigation buttons.

```javascript
const {
  useState,
  useCallbackBinding,
  createElement,
} = require("../../deact/deact");
const { ButtonStyle } = require("discord.js");
const Button = require("../../deact/elements/Button");

module.exports = async (ref, { maxPage }) => {
  const [page, setPage] = useState(1, ref);

  const scrollKey = useCallbackBinding((_, data) => {
    setPage((p) => (data.action === "prev" ? p - 1 : p + 1));
  }, ref);

  return {
    contents: [`Page ${page} of ${maxPage}`],
    components: [
      [
        createElement(Button, {
          label: "◄",
          style: ButtonStyle.Secondary,
          callbackBindingKey: scrollKey,
          data: { action: "prev" },
          disabled: page <= 1,
        }),
        createElement(Button, {
          label: "►",
          style: ButtonStyle.Secondary,
          callbackBindingKey: scrollKey,
          data: { action: "next" },
          disabled: page >= maxPage,
        }),
      ],
    ],
  };
};
```

Key points:

- Single callback handles both buttons using `data.action`
- Disable prev button when `page <= 1`
- Disable next button when `page >= maxPage`
- Use functional update `setPage((p) => ...)` to ensure correct state
