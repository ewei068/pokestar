const { buildEventsSend } = require("../../embeds/helpEmbeds");

// events.js is a small parent script that encapsulates buildEventsSend from helpEmbeds.

const events = async () =>
  await buildEventsSend({
    page: 1,
  });

const eventsMessageCommand = async (interaction) => {
  const { send, err } = await events();
  if (err) {
    await interaction.channel.send(`${err}`);
    return { err };
  }
  await interaction.channel.send(send);
};

const eventsSlashCommand = async (interaction) => {
  const { send, err } = await events();
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: eventsMessageCommand,
  slash: eventsSlashCommand,
};
