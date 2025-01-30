const { getTrainer } = require("../../services/trainer");
const { giveNewPokemons } = require("../../services/gacha");
const { buildNewPokemonEmbed } = require("../../embeds/pokemonEmbeds");
const { stageNames } = require("../../config/stageConfig");

// give.js is used to give a user a pokemon of any level within the limits and any equipment. Anyone can use in Alpha, no one can use in beta onwards.

const give = async (user, pokemonId, level, equipmentLevel) => {
  if (process.env.STAGE !== stageNames.ALPHA) {
    return { send: null, err: "This command is not available yet." };
  }
  // TODO: restrict users who can use?

  // restrict level
  if (level < 1 || level > 100) {
    return { send: null, err: "Invalid level" };
  }

  // restrict equipment level
  if (equipmentLevel < 1 || equipmentLevel > 10) {
    return { send: null, err: "Invalid equipment level" };
  }

  // get trainer
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }

  // give pokemon
  const givePokemon = await giveNewPokemons(trainer.data, [pokemonId], level, {
    equipmentLevel,
  });
  if (givePokemon.err) {
    return { send: null, err: givePokemon.err };
  }

  const embed = buildNewPokemonEmbed(givePokemon.data.pokemons[0]);
  const send = {
    content: `${givePokemon.data.pokemons[0]._id}`,
    embeds: [embed],
  };

  return { send, err: null };
};

const giveMessageCommand = async (message) => {
  const args = message.content.split(" ");
  const pokemonId = args[1];
  const level = args[2] || 5;
  const equipmentLevel = args[3] || 1;
  const { send, err } = await give(
    message.author,
    pokemonId,
    level,
    equipmentLevel
  );
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const giveSlashCommand = async (interaction) => {
  const pokemonId = interaction.options.getString("pokemonid");
  const level = interaction.options.getInteger("level") || 5;
  const equipmentLevel = interaction.options.getInteger("equipmentlevel") || 1;
  const { send, err } = await give(
    interaction.user,
    pokemonId,
    level,
    equipmentLevel
  );
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: giveMessageCommand,
  slash: giveSlashCommand,
};
