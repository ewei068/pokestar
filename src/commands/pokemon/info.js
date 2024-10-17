/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * info.js is used to allow the user to get information about a specific pokemon.
 */
const {
  buildPokemonInfoSend,
  getIdFromNameOrId,
} = require("../../services/pokemon");

/**
 * Gets information about a Pokemon, returning an embed with the Pokemon's info.
 * @param {object} user User who initiated the command.
 * @param {string} pokemonId ID of the Pokemon to get info about.
 * @returns Embed with Pokemon's info.
 */
const info = async (user, pokemonId) =>
  await buildPokemonInfoSend({
    user,
    pokemonId,
  });

const infoMessageCommand = async (message) => {
  const pokemonId = message.content.split(" ")[1];
  const { send, err } = await info(message.author, pokemonId);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const infoSlashCommand = async (interaction) => {
  const nameOrId = interaction.options.getString("name_or_id");
  const idRes = await getIdFromNameOrId(
    interaction.user,
    nameOrId,
    interaction
  );
  if (idRes.err) {
    await interaction.editReply(`${idRes.err}`);
    return { err: idRes.err };
  }
  const pokemonId = idRes.data;
  const { send, err } = await info(interaction.user, pokemonId);
  if (err) {
    await interaction.editReply(`${err}`);
    return { err };
  }
  await interaction.editReply(send);
};

module.exports = {
  message: infoMessageCommand,
  slash: infoSlashCommand,
};
