/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * celebi.js celebi.
 */
const { buildCelebiSend } = require("../../services/mythic");

const celebi = async (user) => await buildCelebiSend(user);

const celebiMessageCommand = async (message) => {
  const { send, err } = await celebi(message.author);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const celebiSlashCommand = async (interaction) => {
  const { send, err } = await celebi(interaction.user);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: celebiMessageCommand,
  slash: celebiSlashCommand,
};
