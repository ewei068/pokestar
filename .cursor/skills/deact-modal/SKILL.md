---
name: deact-modal
description: Create or use Discord modals with Deact. Use when implementing form inputs and text submissions.
---

# Deact Modals

## Overview

Modals in Deact require two parts:

1. **Modal builder function** - Creates the Discord ModalBuilder (in `src/modals/`)
2. **Deact integration** - Opens modal and handles submission (in element)

## Quick Reference

**Modal builder location:** `src/modals/<category>Modals.js`
**Text input component:** `src/modals/components/textInputRow.js`

## Part 1: Modal Builder Function

### Simple Text Input Modal

```javascript
// src/modals/myModals.js
const { buildGenericTextInputModal } = require("./genericModals");

/**
 * @param {object} param0
 * @param {string} param0.id - Component ID (provided by Deact)
 * @param {string=} param0.title
 * @param {string=} param0.value - Pre-fill value
 * @param {boolean=} param0.required
 */
const buildMySearchModal = ({ id, title = "Search", value, required = true }) =>
  buildGenericTextInputModal({
    id,
    textInputId: "searchInput", // Used to retrieve value
    title,
    label: "Enter search term",
    placeholder: "Type here...",
    value,
    required,
  });

module.exports = { buildMySearchModal };
```

### Custom Modal with Multiple Inputs

```javascript
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

const buildCustomModal = ({ id, title = "Custom Form" }) => {
  const modal = new ModalBuilder().setCustomId(id).setTitle(title);

  const nameInput = new TextInputBuilder()
    .setCustomId("nameInput")
    .setLabel("Name")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const descInput = new TextInputBuilder()
    .setCustomId("descriptionInput")
    .setLabel("Description")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(descInput),
  );

  return modal;
};

module.exports = { buildCustomModal };
```

## Part 2: Using Modal in Deact Element

### Step-by-Step Integration

```javascript
const {
  useState,
  useCallbackBinding,
  useModalSubmitCallbackBinding,
  createModal,
  createElement,
} = require("../../deact/deact");
const { ButtonStyle } = require("discord.js");
const Button = require("../../deact/elements/Button");
const { buildMySearchModal } = require("../../modals/myModals");

module.exports = async (ref, { initialValue }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue, ref);

  // 1. Handle modal submission
  const onSubmitKey = useModalSubmitCallbackBinding((interaction) => {
    const value = interaction.fields.getTextInputValue("searchInput");
    setSearchTerm(value);
  }, ref);

  // 2. Open modal (MUST use defer: false)
  const openModalKey = useCallbackBinding(
    (interaction) => {
      return createModal(
        buildMySearchModal,
        { title: "Search", value: searchTerm },
        onSubmitKey,
        interaction,
        ref,
      );
    },
    ref,
    { defer: false }, // Required for modals!
  );

  return {
    contents: [searchTerm ? `Searching: ${searchTerm}` : "Click to search"],
    components: [
      [
        createElement(Button, {
          emoji: "🔎",
          label: "Search",
          callbackBindingKey: openModalKey,
          style: searchTerm ? ButtonStyle.Primary : ButtonStyle.Secondary,
        }),
      ],
    ],
  };
};
```

## createModal API

```javascript
createModal(
  modalBuilderFunction, // Function that returns ModalBuilder
  props, // Props passed to builder (without id)
  submitCallbackKey, // From useModalSubmitCallbackBinding
  interaction, // Current interaction
  ref, // DeactElement ref
  data, // Optional extra data (available in submit callback)
);
```

## Retrieving Form Values

In the submit callback, use `interaction.fields.getTextInputValue(inputId)`:

```javascript
const onSubmitKey = useModalSubmitCallbackBinding((interaction, data) => {
  const name = interaction.fields.getTextInputValue("nameInput");
  const description = interaction.fields.getTextInputValue("descriptionInput");

  // data contains any extra data passed to createModal
  console.log(data.extraInfo);

  setFormData({ name, description });
}, ref);
```

## Complete Example: Search with Clear

```javascript
const {
  useState,
  useCallbackBinding,
  useModalSubmitCallbackBinding,
  createModal,
  createElement,
} = require("../../deact/deact");
const { ButtonStyle } = require("discord.js");
const Button = require("../../deact/elements/Button");
const { buildGenericTextInputModal } = require("../../modals/genericModals");

const buildSearchModal = ({ id, value }) =>
  buildGenericTextInputModal({
    id,
    textInputId: "query",
    title: "Search",
    label: "Search Query",
    placeholder: "Enter search term...",
    value,
    required: false,
  });

module.exports = async (ref, {}) => {
  const [query, setQuery] = useState("", ref);

  const submitKey = useModalSubmitCallbackBinding((interaction) => {
    setQuery(interaction.fields.getTextInputValue("query"));
  }, ref);

  const openKey = useCallbackBinding(
    (interaction) =>
      createModal(
        buildSearchModal,
        { value: query },
        submitKey,
        interaction,
        ref,
      ),
    ref,
    { defer: false },
  );

  const clearKey = useCallbackBinding(() => setQuery(""), ref);

  return {
    contents: [query ? `Results for: "${query}"` : "No search active"],
    components: [
      [
        createElement(Button, {
          emoji: "🔎",
          callbackBindingKey: openKey,
          style: query ? ButtonStyle.Primary : ButtonStyle.Secondary,
        }),
        createElement(Button, {
          emoji: "❌",
          label: "Clear",
          callbackBindingKey: clearKey,
          disabled: !query,
        }),
      ],
    ],
  };
};
```

## Key Rules

1. **`defer: false` is required** for the button that opens the modal
2. **Modal builder receives `id` from Deact** - don't set it manually
3. **Use `useModalSubmitCallbackBinding`** for submit handlers
4. **Return `createModal()`** from the open callback
5. **`textInputId` must match** between builder and `getTextInputValue()`
