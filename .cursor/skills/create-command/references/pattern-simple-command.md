# Pattern: Simple Command

A basic command without interactive UI that performs an action and returns a result.

## Example: partyInfo.js

```javascript
const { getTrainer } = require("../../services/trainer");
const { getPartyPokemons } = require("../../services/party");
const { buildPartyEmbed } = require("../../embeds/battleEmbeds");

const partyInfo = async (user) => {
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }

  const partyPokemons = await getPartyPokemons(trainer.data);
  if (partyPokemons.err || !partyPokemons.data) {
    return { send: null, err: partyPokemons.err };
  }

  const embed = buildPartyEmbed(trainer.data, partyPokemons.data);

  const send = {
    embeds: [embed],
    components: [], // Optional: add component rows
  };
  return { send, err: null };
};

const partyInfoMessageCommand = async (message) => {
  const { send, err } = await partyInfo(message.author);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const partyInfoSlashCommand = async (interaction) => {
  const { send, err } = await partyInfo(interaction.user);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: partyInfoMessageCommand,
  slash: partyInfoSlashCommand,
};
```

## Key Points

1. **Shared logic function**: The core `partyInfo(user)` function is shared between message and slash commands
2. **Return pattern**: Return `{ send, err }` where:
   - `send` is the Discord message payload (embeds, components, content)
   - `err` is an error string or null
3. **User access**:
   - Message commands: `message.author`
   - Slash commands: `interaction.user`
4. **Response methods**:
   - Message commands: `message.channel.send()`
   - Slash commands: `interaction.reply()`

## Minimal Example

```javascript
const pingMessageCommand = async (message) => {
  await message.channel.send("pong!");
};

const pingSlashCommand = async (interaction) => {
  await interaction.reply("pong!");
};

module.exports = {
  message: pingMessageCommand,
  slash: pingSlashCommand,
};
```
