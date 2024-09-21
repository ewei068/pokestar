/**
 * This file is used to deploy the slash commands to the discord server.
 * Should be used sparingly after testing.
 */

require("dotenv").config();

const { REST, Routes } = require("discord.js");
const {
  commandConfig,
  commandCategoryConfig,
} = require("../config/commandConfig");
const { buildSlashCommand } = require("../handlers/commandHandler");
const { logger } = require("../log");

const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;
const commands = [];

// iterate over command config categories and commands
for (const commandCategory in commandCategoryConfig) {
  const commandCategoryData = commandCategoryConfig[commandCategory];
  for (const commandName of commandCategoryData.commands) {
    const commandData = commandConfig[commandName];
    if (commandData.stages.includes(process.env.STAGE)) {
      // eslint-disable-next-line no-console
      console.log(commandName, commandData);
      const slashCommand = buildSlashCommand(commandData);
      if (!slashCommand) {
        continue;
      }
      commands.push(slashCommand.toJSON());
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    logger.info(
      `Started refreshing ${commands.length} application (/) commands.`
    );
    logger.info(JSON.stringify(commands, null, 2));

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    logger.info(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    logger.error(error);
  }
})();
