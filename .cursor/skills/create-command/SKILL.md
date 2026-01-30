---
name: create-command
description: Add Discord commands to the bot. Use when implementing new slash commands or message commands.
---

# Creating Commands

## Quick Reference

**Files to modify:**

1. `src/config/commandConfig.js` - Add category (if needed) and command configuration
2. `src/commands/<category>/<command>.js` - Implement the command

**For interactive UI commands:** Also refer to the `create-deact-element` skill.

## Step 1: Add Command Category (if needed)

If an appropriate category doesn't exist, add it to `commandCategoryConfigRaw`:

```javascript
const commandCategoryConfigRaw = {
  // ... existing categories
  yourCategory: {
    name: "Your Category",
    description: "Description of this category",
    folder: "yourCategory",
    commands: ["yourcommand"],
  },
};
```

Then create the directory: `src/commands/yourCategory/`

## Step 2: Add to Category Commands List

Add your command name to the appropriate category's `commands` array:

```javascript
yourCategory: {
  // ...
  commands: ["existingcommand", "yourcommand"],  // Add here
},
```

## Step 3: Add Command Configuration

Add your command to `commandConfigRaw`:

```javascript
yourcommand: {
  name: "Your Command",
  aliases: ["yourcommand", "yc"],  // First alias is the primary command name
  description: "Short description for help text",
  longDescription: "Detailed description shown in /help yourcommand",
  execute: "yourCommand.js",  // File in src/commands/<category>/
  args: {
    requiredArg: {
      type: "string",
      description: "Description of the argument",
      optional: false,
      variable: false,
    },
    optionalArg: {
      type: "int",
      description: "Optional argument",
      optional: true,
      variable: false,
    },
  },
  stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  exp: 10,      // Optional: XP reward
  money: 25,    // Optional: Money reward
},
```

### Argument Types

| Type      | Discord.js Method | Description        |
| --------- | ----------------- | ------------------ |
| `string`  | `getString()`     | Text input         |
| `int`     | `getInteger()`    | Integer number     |
| `bool`    | `getBoolean()`    | True/false         |
| `user`    | `getUser()`       | @mentioned user    |
| `channel` | `getChannel()`    | #channel reference |

### Argument Options

| Property      | Type      | Description                                    |
| ------------- | --------- | ---------------------------------------------- |
| `type`        | `string`  | One of the types above                         |
| `description` | `string`  | Shown in slash command hints                   |
| `optional`    | `boolean` | Whether argument is required                   |
| `variable`    | `boolean` | If true, captures remaining args (string only) |
| `enum`        | `any[]`   | Restrict to specific values                    |

## Step 4: Implement the Command

Create `src/commands/<category>/yourCommand.js`:

```javascript
const yourCommandMessageCommand = async (message) => {
  // Parse args from message.content
  // Execute command logic
  // Send response via message.channel.send()
};

const yourCommandSlashCommand = async (interaction) => {
  // Get args from interaction.options
  // Execute command logic
  // Send response via interaction.reply()
};

module.exports = {
  message: yourCommandMessageCommand,
  slash: yourCommandSlashCommand,
};
```

## Subcommands

For commands with subcommands (e.g., `/party add`):

### Parent Command (entry point only)

```javascript
party: {
  name: "Party",
  aliases: ["party"],
  description: "Entry point for party commands",
  subcommands: ["partyinfo", "partyadd", "partyremove"],  // List subcommands
  args: {},
  stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  // NO execute property - parent is just an entry point
},
```

### Subcommand

```javascript
partyadd: {
  name: "Party Add",
  aliases: ["partyadd", "pa"],
  description: "Add a Pokemon to your party",
  execute: "partyAdd.js",
  args: { /* ... */ },
  stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
  parent: "party",  // Reference to parent command
},
```

**Naming convention:** Subcommand ID is `parentsubcommand` (e.g., `partyadd`, `tradeinfo`).

## Command Implementation Patterns

See `references/` for implementation examples:

- `pattern-simple-command.md` - Basic command without interactive UI
- `pattern-deact-command.md` - Command using Deact for interactive UI
- `pattern-args-parsing.md` - Parsing arguments from message and slash commands

## Common Gotchas

1. **Command ID must be alphabetic and lowercase**: The config validates that command IDs have no capital letters.

2. **Stages control availability**: Only include stages where the command should be active:
   - `stageNames.ALPHA` - Development/testing
   - `stageNames.BETA` - Beta testing
   - `stageNames.PROD` - Production

3. **Argument names in slash commands**: Use `getString("argname")` where `argname` is lowercase.

4. **Variable arguments**: Only the last argument can have `variable: true`.

5. **Enum values**: For args with `enum`, the values must match exactly what users can input.

## Related Skills

- `create-deact-element` - Creating interactive UI components
- `deact-component-callback` - Handling button clicks and selections
