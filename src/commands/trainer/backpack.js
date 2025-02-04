/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * backpack.js Creates a system to display the user's backpack for them.
 */
const { getTrainer } = require("../../services/trainer");
const {
  DEPRECATEDbuildBackpackEmbed: buildBackpackEmbed,
} = require("../../embeds/trainerEmbeds");

/**
 * Displays the user's backpack items.
 * @param {Object} user User who initiated the command.
 * @returns Embed with user's backpack items.
 */
const backpack = async (user) => {
  // get trainer
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { embed: null, err: trainer.err };
  }
  // build backpack embed
  const embed = buildBackpackEmbed(trainer.data);
  return { embed, err: null };
};

const backpackMessageCommand = async (message) => {
  const { embed, err } = await backpack(message.author);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send({ embeds: [embed] });
};

const backpackSlashCommand = async (interaction) => {
  const { embed, err } = await backpack(interaction.user);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply({ embeds: [embed] });
};

module.exports = {
  message: backpackMessageCommand,
  slash: backpackSlashCommand,
};
