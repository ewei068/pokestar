/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * invite.js server invite magic.
 */
const { buildUrlButton } = require("../../components/urlButton");
const { INVITE_URL } = require("../../config/socialConfig");

const invite = async () => {
  const button = buildUrlButton([
    {
      label: "Invite",
      url: INVITE_URL,
    },
  ]);
  const send = {
    content: "Invite me to your server!",
    components: [button],
  };

  return { send, err: null };
};

const inviteMessageCommand = async (message) => {
  const { send, err } = await invite();
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const inviteSlashCommand = async (interaction) => {
  const { send, err } = await invite();
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: inviteMessageCommand,
  slash: inviteSlashCommand,
};
