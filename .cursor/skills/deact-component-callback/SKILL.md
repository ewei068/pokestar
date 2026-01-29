---
name: deact-component-callback
description: Handle Discord component interactions in Deact. Use when implementing button clicks, select menus, and user input.
---

# Deact Component Callbacks

## Overview

Deact uses `useCallbackBinding` to connect Discord component interactions (buttons, select menus) to handler functions. The callback is invoked when a user interacts with the component.

## Basic Pattern

```javascript
const {
  useState,
  useCallbackBinding,
  createElement,
} = require("../../deact/deact");
const Button = require("../../deact/elements/Button");

module.exports = async (ref, {}) => {
  const [count, setCount] = useState(0, ref);

  // 1. Create callback binding
  const onClickKey = useCallbackBinding(() => {
    setCount((c) => c + 1);
  }, ref);

  // 2. Pass to component
  return {
    components: [
      [
        createElement(Button, {
          label: `Count: ${count}`,
          callbackBindingKey: onClickKey,
        }),
      ],
    ],
  };
};
```

## Callback Parameters

```javascript
const callbackKey = useCallbackBinding(
  (interaction, data) => {
    // interaction: Discord MessageComponentInteraction
    // data: Custom data object passed from component
  },
  ref,
  options,
);
```

### interaction Object

- `interaction.user` - User who clicked
- `interaction.values` - Selected values (for select menus)
- `interaction.customId` - Component ID (managed by Deact)

### data Object

Custom data passed via component's `data` prop:

```javascript
createElement(Button, {
  callbackBindingKey: myKey,
  data: { action: "delete", itemId: 123 },
});

// In callback:
const callbackKey = useCallbackBinding((interaction, data) => {
  console.log(data.action); // "delete"
  console.log(data.itemId); // 123
}, ref);
```

## Options

```javascript
useCallbackBinding(callback, ref, {
  defer: true,           // Defer interaction update (default: true)
  userIdForFilter: ...,  // Restrict who can interact
});
```

### defer Option

- `defer: true` (default) - Deact handles the interaction response
- `defer: false` - Required when showing modals

```javascript
// Normal callback
const normalKey = useCallbackBinding(() => setValue(1), ref);

// Modal callback (defer: false required)
const modalKey = useCallbackBinding(
  async (interaction) =>
    await createModal(builder, props, submitKey, interaction, ref),
  ref,
  { defer: false },
);
```

## Async Callbacks

Callbacks can and almost always should be async:

```javascript
const saveKey = useCallbackBinding(async (interaction, data) => {
  await saveToDatabase(data.itemId);
  setIsSaved(true);
}, ref);
```

## Error Handling

Return an error object to show error message:

```javascript
const actionKey = useCallbackBinding(async (interaction, data) => {
  const result = await performAction(data.id);

  if (result.err) {
    return { err: result.err }; // Shows error to user
  }

  setData(result.data);
}, ref);
```

## Key Rules

1. **Use `useCallbackBinding`** for buttons and select menus
2. **Use `useModalSubmitCallbackBinding`** for modal submissions
3. **Set `defer: false`** when opening modals
4. **Pass context via `data` prop** to identify which component triggered
5. **Callbacks automatically trigger re-render** when state changes
6. **Return `{ err: "message" }`** to show errors

## Related Skills

- `use-deact-hook` - All available hooks including useCallbackBinding
- `deact-modal` - Using modals with callbacks

## References

- `references/user-id-filter.md` - Restricting who can interact with components
- `references/button-callbacks.md` - Button click patterns (simple, with data, toggle, shared)
- `references/select-menu-callbacks.md` - Select menu patterns
- `references/pattern-yes-no.md` - Yes/No confirmation pattern
- `references/pattern-pagination.md` - Prev/Next pagination pattern
