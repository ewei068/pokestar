// echo.js is simply used as the echo function for displaying given commands etc. 'echoing' back what was sent. Can be used in debugging or for displaying to the user.

const echoMessageCommand = async (message) => {
  const args = message.content.split(" ");
  args.shift();
  await message.channel.send(args.join(" "));
};

const echoSlashCommand = async (interaction) => {
  const args = interaction.options._hoistedOptions;
  await interaction.reply(args[0].value);
};

module.exports = {
  message: echoMessageCommand,
  slash: echoSlashCommand,
};
