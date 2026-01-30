# Using Custom Hooks

Custom hooks from `src/hooks/` return state, setters, and pre-built elements.

```javascript
const usePagination = require("../../hooks/usePagination");

module.exports = async (ref, { items }) => {
  const {
    page,
    items: pageItems,
    scrollButtonsElement,
  } = usePagination({ allItems: items, pageSize: 10 }, ref);

  return {
    embeds: [buildListEmbed(pageItems, page)],
    components: [scrollButtonsElement],
  };
};
```

Key points:

- Pass `ref` as the last argument to hooks
- Hooks can return pre-built `createElement` results
- Async hooks must be `await`ed

See `use-deact-hook` skill for hook usage and `create-deact-hook` skill for creating custom hooks.
