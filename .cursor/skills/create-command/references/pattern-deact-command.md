# Pattern: Deact Command

A command that uses the Deact framework for interactive UI with state management.

## Example: list.js

```javascript
const { getUserFromInteraction } = require("../../utils/utils");
const { createRoot } = require("../../deact/deact");
const PokemonList = require("../../elements/pokemon/PokemonList");

const list = async (
  interaction,
  page,
  filterBy,
  filterValue,
  sortBy,
  descending,
) =>
  await createRoot(
    PokemonList,
    {
      user: getUserFromInteraction(interaction),
      initialPage: page,
      initialFilterBy: filterBy,
      initialFilterValue: filterValue,
      initialSortBy: sortBy,
      initialSortDescending: descending,
    },
    interaction,
    { ttl: 300 }, // Time-to-live in seconds for interactive session
  );

const listMessageCommand = async (message) => {
  const args = message.content.split(" ");
  const page = args[1] ? parseInt(args[1], 10) : 1;
  const filterBy = args[2] ? args[2] : "none";
  const filterValue = args[3] ? args[3] : null;
  const sortBy = args[4] ? args[4] : null;
  const descending = args[5] === "true";
  return await list(message, page, filterBy, filterValue, sortBy, descending);
};

const listSlashCommand = async (interaction) => {
  const page = interaction.options.getInteger("page") ?? 1;
  const filterBy = interaction.options.getString("filterby") ?? "none";
  const filterValue = interaction.options.getString("filtervalue") ?? null;
  const sortBy = interaction.options.getString("sortby") ?? null;
  const descending = interaction.options.getBoolean("descending") ?? false;
  return await list(
    interaction,
    page,
    filterBy,
    filterValue,
    sortBy,
    descending,
  );
};

module.exports = {
  message: listMessageCommand,
  slash: listSlashCommand,
};
```

## Key Points

1. **createRoot**: Creates an interactive Deact UI session
   - First arg: The Deact element component
   - Second arg: Props to pass to the element
   - Third arg: The interaction (message or slash interaction)
   - Fourth arg: Options object (typically `{ ttl: seconds }`)

2. **getUserFromInteraction**: Utility to extract user from either message or slash interaction

3. **Return pattern**: Just return the `createRoot` result directly - it handles the response

## createRoot Signature

```javascript
createRoot(
  element, // Deact element function
  props, // Props object for the element
  interaction, // Discord.js Message or CommandInteraction
  options, // { ttl: number } - session timeout in seconds
);
```

## When to Use Deact

Use Deact when your command needs:

- Pagination
- Interactive buttons that update the display
- Select menus that change state
- Multi-step workflows
- Any UI that responds to user interactions

## Related Skills

- `create-deact-element` - Creating the Deact element component
- `deact-component-callback` - Handling button/select interactions
- `use-deact-hook` - Using state and other hooks in elements
