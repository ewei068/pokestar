---
name: create-deact-element
description: Create Deact UI elements for Discord bot interfaces. Use when building new UI components.
---

# Creating Deact Elements

## Quick Reference

**File location:** `src/elements/<category>/YourElement.js`

You may create a new category if no category is appropriate.

## Element Structure

```javascript
const { createElement } = require("../../deact/deact");
const Button = require("../../deact/elements/Button");

/**
 * @type {DeactElementFunction<{
 *   propName: string,
 *   optionalProp?: number,
 * }>}
 */
module.exports = async (ref, { propName, optionalProp = 10 }) => {
  return {
    contents: [],
    embeds: [],
    components: [],
  };
};
```

## Return Object (ComposedElements)

| Property     | Type                                        | Description                 |
| ------------ | ------------------------------------------- | --------------------------- |
| `contents`   | `string[]`                                  | Text content (concatenated) |
| `embeds`     | `EmbedBuilder[]`                            | Discord embeds (max 10)     |
| `components` | `(Component[] \| CreateElementResult)[]`    | Component rows (max 5)      |
| `elements`   | `(CreateElementResult \| ElementPayload)[]` | Child elements              |
| `err`        | `string`                                    | Return early with error     |

## Component Layout

Components use a 2D array: outer = rows, inner = components in that row.

```javascript
return {
  components: [
    // Row 1: Multiple buttons
    [
      createElement(Button, { label: "A", callbackBindingKey: keyA }),
      createElement(Button, { label: "B", callbackBindingKey: keyB }),
    ],
    // Row 2: Single component (select menu takes full row)
    createElement(StringSelectMenu, { options, callbackBindingKey }),
    // Conditional row
    showExtra
      ? [createElement(Button, { label: "C", callbackBindingKey: keyC })]
      : [],
  ],
};
```

## Simple Element Example

```javascript
const { ButtonStyle } = require("discord.js");
const { createElement } = require("../../deact/deact");
const Button = require("../../deact/elements/Button");

module.exports = async (
  ref,
  { callbackBindingKey, style = ButtonStyle.Primary },
) => ({
  components: [
    createElement(Button, {
      emoji: "↩",
      label: "Return",
      style,
      callbackBindingKey,
      data: {},
    }),
  ],
});
```

## Key Rules

1. **First parameter is always `ref`** - The DeactElement instance
2. **Props are destructured from second parameter**
3. **All hooks require `ref` as last argument**
4. **Return `{ err: "message" }` for early error exits**
5. **Use `createElement()` for child Deact elements**
6. **Use raw Discord.js builders for legacy component integration**

## JSDoc Type Annotation

```javascript
/**
 * @type {DeactElementFunction<{
 *   requiredProp: string,
 *   optionalProp?: number,
 *   callbackProp: (value: string) => void,
 * }>}
 */
module.exports = async (
  ref,
  { requiredProp, optionalProp = 5, callbackProp },
) => {
  // ...
};
```

## Related Skills

- `use-deact-hook` - Using hooks for state, memoization, and effects
- `deact-component-callback` - Handling button clicks and select menu interactions
- `create-deact-hook` - Creating reusable custom hooks
- `create-deact-modal` - Creating and using Discord modals

## References

- `references/pattern-element-with-state.md` - Element with useState and callbacks
- `references/pattern-data-fetching.md` - Element with async data fetching
- `references/pattern-composing-elements.md` - Composing child Deact elements
- `references/pattern-using-hooks.md` - Using custom hooks from src/hooks/
