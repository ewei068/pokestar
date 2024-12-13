const { createRoot } = require("../../deact/deact");
const TutorialList = require("../../elements/quest/TutorialList");
const { getUserFromInteraction } = require("../../utils/utils");

const tutorial = async (interaction, page) =>
  await createRoot(
    TutorialList,
    {
      user: getUserFromInteraction(interaction),
      initialStagePage: page,
    },
    interaction,
    {
      ttl: 150,
    }
  );

const tutorialMessageCommand = async (message) => {
  const page = message.content.split(" ")[1]
    ? parseInt(message.content.split(" ")[1], 10)
    : undefined;

  return await tutorial(message, page);
};

const tutorialSlashCommand = async (interaction) => {
  const page = interaction.options.getInteger("page")
    ? interaction.options.getInteger("page")
    : undefined;

  return await tutorial(interaction, page);
};

/* const tutorial = async (page) => {
  const send1 = {
    content: quickstartString,
    ephemeral: true,
  };

  const { send: send2, err } = await buildTutorialSend({
    page,
  });
  if (err) return { send1: null, send2: null, err };

  return { send1, send2, err: null };
};

const tutorialMessageCommand = async (message) => {
  const page = message.content.split(" ")[1]
    ? parseInt(message.content.split(" ")[1], 10)
    : 1;
  const { send1, send2, err } = await tutorial(page);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.reply(send1);
  await message.channel.send(send2);
};

const tutorialSlashCommand = async (interaction) => {
  const page = interaction.options.getInteger("page") || 1;
  const { send1, send2, err } = await tutorial(page);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send1);
  await interaction.followUp(send2);
}; */

module.exports = {
  message: tutorialMessageCommand,
  slash: tutorialSlashCommand,
};
