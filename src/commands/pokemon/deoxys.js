/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * deoxys.js deoxys.
 */
const { buildDeoxysSend } = require("../../services/mythic");

const deoxys = async (user) => await buildDeoxysSend(user);

const deoxysMessageCommand = async (message) => {
  const { send, err } = await deoxys(message.author);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const deoxysSlashCommand = async (interaction) => {
  const { send, err } = await deoxys(interaction.user);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: deoxysMessageCommand,
  slash: deoxysSlashCommand,
};
