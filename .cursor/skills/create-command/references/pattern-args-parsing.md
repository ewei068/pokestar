# Pattern: Argument Parsing

How to parse command arguments from message commands and slash commands.

## Message Command Parsing

Arguments are extracted from `message.content` by splitting on spaces:

```javascript
const yourCommandMessageCommand = async (message) => {
  const args = message.content.split(" ");
  // args[0] is the command itself (e.g., "!list")
  // args[1], args[2], etc. are the arguments

  const page = args[1] ? parseInt(args[1], 10) : 1;
  const name = args[2] ? args[2] : null;
  const enabled = args[3] === "true";

  return await yourCommand(message, page, name, enabled);
};
```

### Variable Arguments (capturing remaining text)

For arguments with `variable: true`:

```javascript
const echoMessageCommand = async (message) => {
  const args = message.content.split(" ");
  // Join all args after the command name
  const messageText = args.slice(1).join(" ");

  await message.channel.send(messageText);
};
```

## Slash Command Parsing

Arguments are retrieved from `interaction.options`:

```javascript
const yourCommandSlashCommand = async (interaction) => {
  // String argument
  const name = interaction.options.getString("name");

  // Integer argument
  const page = interaction.options.getInteger("page") ?? 1;

  // Boolean argument
  const enabled = interaction.options.getBoolean("enabled") ?? false;

  // User argument (@mention)
  const targetUser = interaction.options.getUser("user");

  // Channel argument (#channel)
  const channel = interaction.options.getChannel("channel");

  return await yourCommand(interaction, page, name, enabled);
};
```

### Option Methods by Type

| Arg Type  | Method                | Returns           |
| --------- | --------------------- | ----------------- |
| `string`  | `getString("name")`   | `string \| null`  |
| `int`     | `getInteger("name")`  | `number \| null`  |
| `bool`    | `getBoolean("name")`  | `boolean \| null` |
| `user`    | `getUser("name")`     | `User \| null`    |
| `channel` | `getChannel("name")`) | `Channel \| null` |

### Handling Optional Arguments

```javascript
// Using nullish coalescing for defaults
const page = interaction.options.getInteger("page") ?? 1;

// Using ternary for more complex logic
const filterBy = interaction.options.getString("filterby")
  ? interaction.options.getString("filterby")
  : "none";
```

## Complete Example

Command config:

```javascript
train: {
  name: "Train",
  aliases: ["train", "t"],
  description: "Train a Pokemon",
  execute: "train.js",
  args: {
    pokemonid: {
      type: "string",
      description: "unique ID for Pokemon to train",
      optional: false,
      variable: false,
    },
    location: {
      type: "string",
      description: "location to train at",
      optional: true,
      variable: false,
      enum: ["home", "gym", "dojo"],
    },
  },
  stages: [stageNames.ALPHA, stageNames.BETA, stageNames.PROD],
},
```

Implementation:

```javascript
const train = async (user, pokemonId, location) => {
  // Core logic here
};

const trainMessageCommand = async (message) => {
  const args = message.content.split(" ");
  const pokemonId = args[1];
  const location = args[2] ?? "home";

  if (!pokemonId) {
    await message.channel.send("Please provide a Pokemon ID!");
    return { err: "Missing Pokemon ID" };
  }

  const { send, err } = await train(message.author, pokemonId, location);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const trainSlashCommand = async (interaction) => {
  const pokemonId = interaction.options.getString("pokemonid");
  const location = interaction.options.getString("location") ?? "home";

  const { send, err } = await train(interaction.user, pokemonId, location);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: trainMessageCommand,
  slash: trainSlashCommand,
};
```

## Key Notes

1. **Argument names must be lowercase** in `getString()`, `getInteger()`, etc.
2. **Slash commands validate required args** automatically - Discord won't let users submit without them
3. **Message commands need manual validation** for required arguments
4. **Use `??` (nullish coalescing)** for default values rather than `||` to handle falsy values correctly
