---
name: deact
description: Build Discord UI with Deact, the project's React-inspired framework. Use when creating or changing elements in src/elements, custom hooks in src/hooks, button or select-menu callbacks, or modals.
---

# Deact

Deact renders Discord messages from element functions with React-style hooks and state. The core API is `src/deact/deact.js`; built-in elements are `Button`, `StringSelectMenu`, and `Fragment` in `src/deact/elements/`. Mounting an element from a command is covered by the `create-command` skill.

## Where React habits break

- **`ref` comes first in every element and last in every hook.** `async (ref, props) => ...`, then `useState(initial, ref)`, `useMemo(fn, deps, ref)`, `useCallbackBinding(fn, ref, options)`.
- **Elements are async functions that return objects.** `await` freely inside them. The return value is `{ contents, embeds, components, elements, err }`: `contents` strings are concatenated, `embeds` holds up to 10 `EmbedBuilder`s, `components` up to 5 rows, `elements` holds child `createElement` results, and returning `{ err: "message" }` exits early and shows the error.
- **`components` is a 2D array.** Each outer entry is a row: an array of buttons, a single select menu, or `[]` for a conditional row that renders nothing.
- **Async data uses awaited hooks.** `await useAwaitedMemo(fn, deps, ref)` and `await useAwaitedEffect(fn, deps, ref)`. Hooks run unconditionally and in the same order every render.
- **Interactions bind through keys, not `onClick`.** `useCallbackBinding((interaction, data) => ..., ref, options)` returns a key; pass it as `callbackBindingKey` with an optional `data` object to `Button` or `StringSelectMenu`. State changes in the callback re-render the element, and returning `{ err }` shows an error.

## Callback options

- `defer` defaults to `true`, where Deact acknowledges the interaction. Set `defer: false` on any callback that opens a modal, because a modal must be the interaction's first response.
- `userIdForFilter` defaults to `userTypeEnum.DEFAULT` (only the user who opened the message). Use `userTypeEnum.ANY` for public actions, or pass a specific user ID. `userTypeEnum` is exported from `deact.js`.

## Modals

1. Write a builder in `src/modals/<area>Modals.js` that takes `{ id, ...props }` and returns a `ModalBuilder`; for a single text field, wrap `buildGenericTextInputModal` from `genericModals.js`. Deact supplies `id`.
2. Handle submission with `useModalSubmitCallbackBinding((interaction, data) => ..., ref)` and read fields with `interaction.fields.getTextInputValue(textInputId)`, using the same `textInputId` the builder set.
3. Open it from a `defer: false` callback: `createModal(builder, props, submitKey, interaction, ref, data?)`.

## Custom hooks

Hooks live in `src/hooks/use<Name>.js`, take their options first and `ref` last, compose the primitive hooks, and may return pre-built elements (a toggle button, scroll buttons) alongside state. Document parameters and the return shape with JSDoc. Check the existing hooks before writing one: `usePagination`, `useSelection`, `usePaginationAndSelection`, `useSingleItemScroll`, `useInfoToggle`, `usePokemon`, `usePokemonList`, `useTrainer`.

## Examples

| Pattern                                   | Copy from                                     |
| ----------------------------------------- | --------------------------------------------- |
| Reusable button element                   | `src/elements/foundation/ReturnButton.js`     |
| Yes/no confirmation                       | `src/elements/foundation/YesNoButtons.js`     |
| Select menu from config                   | `src/elements/foundation/IdConfigSelectMenu.js` |
| Paginated list                            | `src/elements/trainer/BackpackList.js`        |
| Async data fetching in a hook             | `src/hooks/useTrainer.js`, `src/hooks/usePokemon.js` |
| Toggle hook returning a button            | `src/hooks/useInfoToggle.js`                  |
| Search modal plus confirmation flow       | `src/elements/pokemon/Jirachi.js`             |
| Composing child elements                  | `src/elements/help/HelpCommand.js`            |
