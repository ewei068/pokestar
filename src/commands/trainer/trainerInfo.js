/**
 * @file
 * @author Elvis Wei
 *
 * trainerInfo.js Created to display the trainer card, or info, of the current user.
 */
const {
  getTrainerWithExtraInfo,
  getTrainerFromId,
  getExtraTrainerInfo,
} = require("../../services/trainer");
const { buildTrainerEmbed } = require("../../embeds/trainerEmbeds");
const { getPartyPokemons } = require("../../services/party");
const { buildPartyEmbed } = require("../../embeds/battleEmbeds");
const { getUserSelectedDevice } = require("../../utils/trainerUtils");
const { getUserId } = require("../../utils/utils");

/**
 * Displays the user's trainer info (trainer card).
 * @param {object} user User who initiated the command.
 * @param {string} targetUserId The target user ID.
 */
const trainerInfo = async (user, targetUserId) => {
  let trainer =
    /** @type {Awaited<ReturnType<getTrainerWithExtraInfo>>} */ ({});
  if (targetUserId && targetUserId !== user.id) {
    const getTrainerFromIdRes = await getTrainerFromId(targetUserId);
    const targetTrainer = getTrainerFromIdRes.data;
    if (getTrainerFromIdRes.err || !targetTrainer?.settings?.publicProfile) {
      return {
        embed: null,
        err: "Trainer not found or trainer has a private profile.",
      };
    }
    trainer = await getExtraTrainerInfo(targetTrainer);
  } else {
    // get trainer info (contains extra info)
    trainer = await getTrainerWithExtraInfo(user);
  }
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
  const args = message.content.split(" ");
  const targetUserId = args[1] ? getUserId(args[1]) : undefined;
  const { send, err } = await trainerInfo(message.author, targetUserId);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const trainerInfoSlashCommand = async (interaction) => {
  const targetUserId = interaction.options.getUser("user")?.id;
  const { send, err } = await trainerInfo(interaction.user, targetUserId);
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
