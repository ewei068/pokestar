---
name: create-deact-hook
description: Create custom Deact hooks for reusable UI logic. Use when extracting shared state/callback patterns.
---

# Creating Deact Hooks

## Quick Reference

**File location:** `src/hooks/useYourHook.js`

**Naming convention:** Always prefix with `use` (e.g., `usePagination`, `useInfoToggle`)

## Hook Structure

```javascript
const {
  useState,
  useCallbackBinding,
  createElement,
} = require("../deact/deact");

/**
 * @param {object} param0
 * @param {number=} param0.initialValue
 * @param {DeactElement} ref
 * @returns {{ value: number, setValue: Function, buttonElement: CreateElementResult }}
 */
const useMyHook = ({ initialValue = 0 }, ref) => {
  // State and logic here

  return {
    // Return values, setters, and pre-built elements
  };
};

module.exports = useMyHook;
```

## Key Differences from React Hooks

1. **`ref` is always the last parameter** (not a hook call)
2. **Hooks can be async** - use `await` for data fetching
3. **Can return `createElement` results** - pre-built UI components

## Simple Hook Example

```javascript
const {
  useState,
  useCallback,
  useCallbackBinding,
  createElement,
} = require("../deact/deact");
const { ButtonStyle } = require("discord.js");
const Button = require("../deact/elements/Button");

const useInfoToggle = ({ initial = false, deferToggle = false }, ref) => {
  const [isToggled, setIsToggled] = useState(initial, ref);

  const toggle = useCallback(
    () => {
      setIsToggled((prev) => !prev);
    },
    [],
    ref,
  );

  const toggleBindingKey = useCallbackBinding(toggle, ref, {
    defer: deferToggle,
  });

  const toggleButton = createElement(Button, {
    label: "ⓘ",
    callbackBindingKey: toggleBindingKey,
    style: isToggled ? ButtonStyle.Primary : ButtonStyle.Secondary,
  });

  return {
    isToggled,
    toggle,
    toggleButton,
  };
};

module.exports = useInfoToggle;
```

## Return Patterns

### Return state + setter + element

```javascript
return {
  value,
  setValue,
  element: createElement(Component, { ... }),
};
```

### Return only element (wrapper hook)

```javascript
return scrollButtonsElement;
```

### Return data + error + element

```javascript
return {
  data,
  err: result.err,
  element,
};
```

## Key Rules

1. **`ref` is always the last parameter**
2. **Prefix hook names with `use`**
3. **Async hooks must be `await`ed when called**
4. **Return pre-built elements for convenience**
5. **Document return type with JSDoc**

## Related Skills

- `use-deact-hook` - How to use hooks in elements (useState, useMemo, useCallbackBinding, etc.)
- `deact-component-callback` - Handling component interactions in callbacks

## References

- `references/pattern-pagination-hook.md` - Pagination with scroll buttons
- `references/pattern-async-data-hook.md` - Async hook with data fetching
- `references/pattern-callback-options.md` - Passing through callback options
