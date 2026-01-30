# Async Hook with Data Fetching

An async hook that fetches data and provides pagination controls.

```javascript
const {
  useState,
  useCallbackBinding,
  useAwaitedMemo,
  createElement,
} = require("../deact/deact");
const { listPokemons } = require("../services/pokemon");
const ScrollButtons = require("../elements/foundation/ScrollButtons");

const usePokemonList = async (
  { userId, initialPage = 1, pageSize = 10 },
  ref,
) => {
  const [page, setPage] = useState(initialPage, ref);

  const prevKey = useCallbackBinding(() => setPage(page - 1), ref);
  const nextKey = useCallbackBinding(() => setPage(page + 1), ref);

  const result = await useAwaitedMemo(
    () => listPokemons(userId, { page, pageSize }),
    [userId, page, pageSize],
    ref,
  );

  const scrollButtonsElement = createElement(ScrollButtons, {
    onPrevPressedKey: prevKey,
    onNextPressedKey: nextKey,
    isPrevDisabled: !!result.err || page === 1,
    isNextDisabled: !!result.err || result.lastPage,
  });

  return {
    page,
    setPage,
    pokemons: result.data,
    err: result.err,
    scrollButtonsElement,
  };
};

module.exports = usePokemonList;
```

Key points:

- Hook is `async` - must be `await`ed when called
- Uses `useAwaitedMemo` for data fetching
- Returns `err` for error handling in element
- Disables buttons on error or boundary conditions
