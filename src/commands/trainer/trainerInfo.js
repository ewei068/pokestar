/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * trainerInfo.js Created to display the trainer card, or info, of the current user.
 */
const { getTrainerInfo } = require("../../services/trainer");
const { buildTrainerEmbed } = require("../../embeds/trainerEmbeds");
const { getPartyPokemons } = require("../../services/party");
const { buildPartyEmbed } = require("../../embeds/battleEmbeds");
const { getUserSelectedDevice } = require("../../utils/trainerUtils");

/**
 * Displays the user's trainer info (trainer card).
 * @param {object} user User who initiated the command.
 * @returns Embed with user's trainer info.
 */
const trainerInfo = async (user) => {
  // get trainer info (contains extra info)
  const trainer = await getTrainerInfo(user);
  if (trainer.err) {
    return { embed: null, err: trainer.err };
  }

  // get party info
  // TODO: should move to another command?
  const partyPokemons = await getPartyPokemons(trainer.data);
  if (partyPokemons.err) {
    return { embed: null, err: partyPokemons.err };
  }

  // build embeds
  const trainerEmbed = buildTrainerEmbed(trainer.data);
  // TODO: should remove?
  const partyEmbed = buildPartyEmbed(trainer.data, partyPokemons.data, {
    isMobile: getUserSelectedDevice(user, trainer.data.settings) === "mobile",
  });

  const send = {
    embeds: [trainerEmbed, partyEmbed],
  };
  return { send, err: null };
};

const trainerInfoMessageCommand = async (message) => {
  const { send, err } = await trainerInfo(message.author);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const trainerInfoSlashCommand = async (interaction) => {
  const { send, err } = await trainerInfo(interaction.user);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: trainerInfoMessageCommand,
  slash: trainerInfoSlashCommand,
};
