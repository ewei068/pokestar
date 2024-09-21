/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * evolve.js looks up a pokemon, returning an embed with the pokemon's valid evolution options.
 */
const { getPokemon, getIdFromNameOrId } = require("../../services/pokemon");
const { getTrainer } = require("../../services/trainer");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { setState } = require("../../services/state");
const {
  buildIdConfigSelectRow: buildSpeciesSelectRow,
} = require("../../components/idConfigSelectRow");
const { buildPokemonEmbed } = require("../../embeds/pokemonEmbeds");
const { eventNames } = require("../../config/eventConfig");

/**
 * Looks up a Pokemon, returning an embed with the Pokemon's valid
 * evolution options.
 * @param {Object} user User who initiated the command.
 * @param {String} pokemonId ID of the Pokemon to evolve.
 * @returns Embed with Pokemon's valid evolution options.
 */
const evolve = async (user, pokemonId) => {
  // get trainer
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }

  // get pokemon
  const pokemon = await getPokemon(trainer.data, pokemonId);
  if (pokemon.err) {
    return { send: null, err: pokemon.err };
  }

  // get species data
  const speciesData = pokemonConfig[pokemon.data.speciesId];

  // check if pokemon can evolve
  if (!speciesData.evolution) {
    return { send: null, err: `${pokemon.data.name} cannot evolve!` };
  }
  const evolutionSpeciesIds = [];
  for (const evolutionConfig of speciesData.evolution) {
    if (evolutionConfig.level) {
      if (pokemon.data.level >= evolutionConfig.level) {
        evolutionSpeciesIds.push(evolutionConfig.id);
      }
    }
    // TODO: add other evolution methods
  }

  // if empty, pokemon cannot evolve
  if (evolutionSpeciesIds.length === 0) {
    return { send: null, err: `${pokemon.data.name} cannot evolve yet!` };
  }

  // build pokemon embed
  const embed = buildPokemonEmbed(trainer.data, pokemon.data);

  // build selection list of pokemon to evolve to
  const stateId = setState(
    {
      userId: user.id,
      pokemonId: pokemon.data._id,
      speciesId: null,
    },
    150
  );
  const selectionRowData = {
    stateId,
  };
  const selectionRow = buildSpeciesSelectRow(
    evolutionSpeciesIds,
    pokemonConfig,
    "Select a pokemon to evolve to:",
    selectionRowData,
    eventNames.POKEMON_EVOLVE_SELECT
  );

  const send = {
    content: `Select a pokemon to evolve ${pokemon.data.name} to:`,
    embeds: [embed],
    components: [selectionRow],
  };
  return { send, err: null };
};

const evolveMessageCommand = async (message) => {
  const args = message.content.split(" ");
  const pokemonId = args[1];
  const { send, err } = await evolve(message.author, pokemonId);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }

  await message.channel.send(send);
};

const evolveSlashCommand = async (interaction) => {
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
  const { send, err } = await evolve(interaction.user, pokemonId);
  if (err) {
    await interaction.editReply(`${err}`);
    return { err };
  }

  await interaction.editReply(send);
};

module.exports = {
  message: evolveMessageCommand,
  slash: evolveSlashCommand,
};
