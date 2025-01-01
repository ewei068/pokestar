/**
 * @file
 * @author Elvis Wei
 *
 * pvp.js is the encapsulating program for the PVP system.
 */
const { getTrainerWithExtraInfo } = require("../../services/trainer");
const { validateParty } = require("../../services/party");
const { Battle } = require("../../battle/engine/Battle");
const { setState } = require("../../services/state");
const { buildButtonActionRow } = require("../../components/buttonActionRow");
const { buildTrainerEmbed } = require("../../embeds/trainerEmbeds");
const { eventNames } = require("../../config/eventConfig");
const { getUserId } = require("../../utils/utils");

/**
 * The encapsulating program for the PVP system.
 * @param {*} user the user given to get the relevant data from.
 * @param {*} opponentUserId the user you want to battle.
 * @param {*} level the balancing level of the battle for both team's pokemon.
 * @returns {Promise<any>} Error or message to send.
 */
const pvp = async (user, opponentUserId, level) => {
  // if opponent user ID equals user ID, return error
  if (opponentUserId === user.id) {
    return { send: null, err: "You can't challenge yourself!" };
  }

  // if level not between 1 and 100, return error
  if (level && (level < 1 || level > 100)) {
    return { send: null, err: "Level must be between 1 and 100." };
  }

  // get trainer
  const trainer = await getTrainerWithExtraInfo(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }

  // validate party
  const validate = await validateParty(trainer.data);
  if (validate.err) {
    return { send: null, err: validate.err };
  }

  // create battle
  const equipmentLevel =
    level !== null ? Math.max(Math.round(level / 10), 1) : null;
  const battle = new Battle({
    level,
    equipmentLevel,
    isPvp: true,
  });
  battle.addTeam("Team1", false);
  battle.addTrainer(trainer.data, validate.data, "Team1");

  // get trainer embed
  const embed = buildTrainerEmbed(trainer.data);

  // create state
  const state = {
    battle,
    userId: user.id,
    opponentUserId,
  };
  const stateId = setState(state, 300);

  // get accept challenge button
  const rowData = {
    stateId,
  };
  const confirmButtonRow = buildButtonActionRow(
    [
      {
        label: "Accept Challenge!",
        disabled: false,
        data: rowData,
      },
    ],
    eventNames.PVP_ACCEPT
  );

  const opponentString = opponentUserId
    ? `<@${opponentUserId}> has `
    : "You have ";
  const levelString =
    level !== null
      ? ` **All Pokemon will be set to level ${level} and equipment set to level ${equipmentLevel}.**`
      : "";

  const send = {
    content: `${opponentString}been challenged to a battle by ${user.username}!${levelString}`,
    embeds: [embed],
    components: [confirmButtonRow],
  };

  return { send, err: null };
};

const pvpMessageCommand = async (message) => {
  const args = message.content.split(" ");
  const opponentUserId = getUserId(args[1]) || null;
  const level = parseInt(args[2], 10) || null;

  const { send, err } = await pvp(message.author, opponentUserId, level);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const pvpSlashCommand = async (interaction) => {
  const opponentUserId = interaction.options.getUser("opponent")
    ? interaction.options.getUser("opponent").id
    : null;
  const level = interaction.options.getInteger("level") || null;

  const { send, err } = await pvp(interaction.user, opponentUserId, level);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: pvpMessageCommand,
  slash: pvpSlashCommand,
};
