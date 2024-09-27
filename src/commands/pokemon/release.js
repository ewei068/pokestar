/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * releases.js is used to release pokemon the trainer has.
 */
const { buildReleaseSend } = require("../../services/pokemon");

/**
 * Fetches a list of a trainer's Pokemon, with a confirmation prompt to release.
 * @param {Object} user User who initiated the command.
 * @param {Array} pokemonIds Array of Pokemon IDs to release.
 * @returns Embed with list of Pokemon, and components for confirmation.
 */
const release = async (user, pokemonIds) =>
  await buildReleaseSend(user, pokemonIds);

const releaseMessageCommand = async (message) => {
  const pokemonIds = message.content.split(" ").slice(1);
  const { send, err } = await release(message.author, pokemonIds);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const releaseSlashCommand = async (interaction) => {
  const pokemonIds = interaction.options.getString("pokemonids").split(" ");
  const { send, err } = await release(interaction.user, pokemonIds);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: releaseMessageCommand,
  slash: releaseSlashCommand,
};
