# Pagination Hook

A hook that manages page state and provides scroll button elements.

```javascript
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
 * @param {DeactElement} ref
 */
const usePagination = ({ allItems, pageSize = 10, initialPage = 1 }, ref) => {
  const maxPage = Math.ceil(allItems.length / pageSize);
  const [page, setPage] = useState(initialPage, ref);
  const pageClamped = Math.min(Math.max(page, 1), maxPage);

  const items = allItems.slice(
    (pageClamped - 1) * pageSize,
    pageClamped * pageSize,
  );

  const prevKey = useCallbackBinding(() => setPage(pageClamped - 1), ref);
  const nextKey = useCallbackBinding(() => setPage(pageClamped + 1), ref);

  const scrollButtonsElement = createElement(ScrollButtons, {
    onPrevPressedKey: prevKey,
    onNextPressedKey: nextKey,
    isPrevDisabled: pageClamped <= 1,
    isNextDisabled: pageClamped >= maxPage,
  });

  return { page: pageClamped, setPage, items, scrollButtonsElement };
};

module.exports = usePagination;
```

Key points:

- Returns sliced items for current page
- Provides pre-built scroll button element
- Clamps page to valid range
