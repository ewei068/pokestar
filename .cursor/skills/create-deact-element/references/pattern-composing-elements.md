# Composing Child Elements

Use `createElement` to include other Deact elements as children.

```javascript
const { createElement } = require("../../deact/deact");
const ScrollButtons = require("../foundation/ScrollButtons");
const YesNoButtons = require("../foundation/YesNoButtons");

module.exports = async (
  ref,
  { page, maxPage, prevKey, nextKey, confirmKey },
) => {
  return {
    embeds: [myEmbed],
    components: [
      createElement(ScrollButtons, {
        onPrevPressedKey: prevKey,
        onNextPressedKey: nextKey,
        isPrevDisabled: page <= 1,
        isNextDisabled: page >= maxPage,
      }),
      createElement(YesNoButtons, {
        onPresssedKey: confirmKey,
      }),
    ],
  };
};
```

Key points:

- Child elements are created with `createElement(Component, props)`
- Children can be placed in `components`, `embeds`, or `elements` arrays
- Child elements receive their own `ref` internally
