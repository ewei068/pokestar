# Element with Data Fetching

An element that fetches async data using `useAwaitedMemo`.

```javascript
const { useAwaitedMemo, createElement } = require("../../deact/deact");
const { fetchData } = require("../../services/myService");

module.exports = async (ref, { userId }) => {
  const data = await useAwaitedMemo(() => fetchData(userId), [userId], ref);

  if (data.err) {
    return { err: data.err };
  }

  return {
    embeds: [buildDataEmbed(data)],
    components: [],
  };
};
```

Key points:

- Use `await` with `useAwaitedMemo` for async data
- Return `{ err: "message" }` for early error exits
- Dependencies array `[userId]` triggers refetch when userId changes

See `use-deact-hook` skill for more on `useAwaitedMemo`.
