---
name: use-deact-hook
description: Use Deact hooks for state management, memoization, and side effects. Reference for all available hooks.
---

# Using Deact Hooks

## Key Difference from React

**All hooks require `ref` as the last parameter.**

```javascript
// React
const [value, setValue] = useState(0);

// Deact
const [value, setValue] = useState(0, ref);
```

## Available Primative Hooks (refer to `deact.js`)

### React-like hooks

- `useState`
- `useRef`
- `useMemo`
- `useCallback`

### Awaited hooks: used to await asynchronous code like data fetching.

```javascript
const userData = await useAwaitedMemo(() => fetchUser(userId), [userId], ref);
```

- `useAwaitedMemo`
- `useAwaitedEffect`

### useCallbackBinding

Bind a callback to Discord component interactions (buttons, select menus). Refer to the `deact-component-callback` skill on how to use.

### useModalSubmitCallbackBinding

Handle modal form submissions.

```javascript
const onSubmitKey = useModalSubmitCallbackBinding(
  (interaction, data) => {
    const inputValue = interaction.fields.getTextInputValue("inputId");
    setFormValue(inputValue);
  },
  ref,
  { defer: true },
);
```

## Common Patterns

### Pagination State

```javascript
const [page, setPage] = useState(1, ref);

const prevKey = useCallbackBinding(() => setPage((p) => p - 1), ref);
const nextKey = useCallbackBinding(() => setPage((p) => p + 1), ref);
```

### Toggle State

```javascript
const [isOpen, setIsOpen] = useState(false, ref);

const toggleKey = useCallbackBinding(() => setIsOpen((v) => !v), ref);
```

### Filtered Data

```javascript
const [filter, setFilter] = useState({}, ref);

const filteredItems = useMemo(
  () => items.filter((item) => matchesFilter(item, filter)),
  [items, filter],
  ref,
);
```

### Data with Loading

```javascript
const result = await useAwaitedMemo(() => fetchData(id), [id], ref);

if (result.err) {
  return { err: result.err };
}

const data = result.data;
```

## Custom Hooks

Custom hooks are created in `src/hooks` and can be used for more specific purposes. Refer to the `create-deact-hook` skill on creating a custom hook.

## Dependency Arrays

Like React, dependencies determine when hooks re-run:

```javascript
// Always recalculates (no deps = every render)
useMemo(() => compute(), [], ref);

// Recalculates when a or b changes
useMemo(() => compute(a, b), [a, b], ref);
```

**Include all values used inside the callback that could change.**

## Key Rules

1. **Always pass `ref` as last argument**
2. **Don't call hooks conditionally** (same as React)
3. **Hooks must be called in same order every render**
4. **`await` async hooks (`useAwaitedMemo`, `useAwaitedEffect`)**
5. **Use `defer: false` for callbacks that show modals**
