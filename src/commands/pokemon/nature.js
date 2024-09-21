/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * nature.js shows the nature of the pokemon.
 */
const {
  buildNatureSend,
  getIdFromNameOrId,
} = require("../../services/pokemon");
const { setState, deleteState } = require("../../services/state");

/**
 * shows the nature of the pokemon via buildNatureSend from pokemon.js.
 * @param {*} user the user making the call.
 * @param {*} pokemonId the id of the pokemon the user gave.
 * @returns
 */
const nature = async (user, pokemonId) => {
  // build selection list of shop categories
  const stateId = setState(
    {
      userId: user.id,
      pokemonId,
    },
    150
  );

  const { send, err } = await buildNatureSend({
    stateId,
    user,
  });
  if (err) {
    deleteState(stateId);
  }

  return { send, err };
};

const natureMessageCommand = async (message) => {
  const args = message.content.split(" ");
  const pokemonId = args[1];
  const { send, err } = await nature(message.author, pokemonId);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }

  await message.channel.send(send);
};

const natureSlashCommand = async (interaction) => {
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
  const { send, err } = await nature(interaction.user, pokemonId);
  if (err) {
    await interaction.editReply(`${err}`);
    return { err };
  }

  await interaction.editReply(send);
};

module.exports = {
  message: natureMessageCommand,
  slash: natureSlashCommand,
};
