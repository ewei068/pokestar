# Select Menu Callbacks

Examples of handling select menu interactions.

## Single Selection

```javascript
const [selected, setSelected] = useState(null, ref);

const selectKey = useCallbackBinding((interaction) => {
  const value = interaction.values[0];
  setSelected(value);
}, ref);

createElement(StringSelectMenu, {
  placeholder: "Choose an option",
  options: [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
  ],
  callbackBindingKey: selectKey,
});
```

Key points:

- `interaction.values` is an array of selected values
- For single-select menus, use `interaction.values[0]`

## With Data Context

Pass additional context via `data`:

```javascript
const selectKey = useCallbackBinding((interaction, data) => {
  const value = interaction.values[0];
  handleSelection(data.category, value);
}, ref);

createElement(StringSelectMenu, {
  options: categoryOptions,
  callbackBindingKey: selectKey,
  data: { category: "items" },
});
```

## Accessing Interaction Details

```javascript
const selectKey = useCallbackBinding((interaction) => {
  const userId = interaction.user.id;
  const username = interaction.user.username;
  const selectedValues = interaction.values;

  processSelection(userId, selectedValues);
}, ref);
```
