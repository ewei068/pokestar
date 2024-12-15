const { createRoot, userTypeEnum } = require("../../deact/deact");
const HelpCategoryList = require("../../elements/help/HelpCategoryList");

const help = async (interaction, command) =>
  await createRoot(
    HelpCategoryList,
    {
      initialCommand: command,
    },
    interaction,
    {
      userIdForFilter: userTypeEnum.ANY,
      ttl: 150,
    }
  );

const helpMessageCommand = async (message) => {
  const args = message.content.split(" ");
  args.shift();
  const command = args[0] || ""; // default to nothing if no args

  return await help(message, command);
};

const helpSlashCommand = async (interaction) => {
  const command = interaction.options.getString("command") || ""; // default to nothing if no args

  return await help(interaction, command);
};
/*
const help = async (command) => {
  // if no args, send help message
  if (command === "") {
    // build state & select row UI
    const stateId = setState(
      {
        messageStack: [],
      },
      150
    );

    const { send, err } = await buildHelpSend({
      stateId,
      view: "help",
      option: null,
    });
    if (err) {
      return { err };
    }
    return send;
  }

  // if args, send help message for specific command

  const providedCommand = command;
  // search through command config for alias
  for (const commandName in commandConfig) {
    const commandData = commandConfig[commandName];
    if (
      commandData.aliases.includes(providedCommand) &&
      commandData.stages.includes(process.env.STAGE)
    ) {
      // build specific command help message
      return { embeds: [buildHelpCommandEmbed(commandData.aliases[0])] };
    }
  }
  return `Command \`${command}\` not found.`;
};

const helpMessageCommand = async (message) => {
  const args = message.content.split(" ");
  args.shift();
  const command = args[0] || ""; // default to nothing if no args

  const helpMessage = await help(command);
  await message.channel.send(helpMessage);
};

const helpSlashCommand = async (interaction) => {
  const command = interaction.options.getString("command") || ""; // default to nothing if no args

  const helpMessage = await help(command);
  await interaction.reply(helpMessage);
}; */

module.exports = {
  message: helpMessageCommand,
  slash: helpSlashCommand,
};
