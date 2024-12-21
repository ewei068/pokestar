/**
 * @file
 * @author Elvis Wei
 *
 * commandHandler.js handles all commands and command types the user can use.
 */
const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const path = require("node:path");
const {
  commandCategoryConfig,
  commandConfig,
} = require("../config/commandConfig");
const { stageConfig } = require("../config/stageConfig");
const { addExpAndMoney } = require("../services/trainer");
const { logger } = require("../log");
const { buildCommandUsageString, attemptToReply } = require("../utils/utils");
const { QueryBuilder } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { removeInteractionInstance } = require("../deact/interactions");
const {
  hasUserMetCurrentTutorialStageRequirements,
} = require("../services/quest");
const { sendUpsells } = require("../services/misc");

const { prefix } = stageConfig[process.env.STAGE];

const messageCommands = {};
const slashCommands = {};
const commandLookup = {};

const buildSingleCommand = (
  commandData,
  commandObject = new SlashCommandBuilder()
) => {
  let name = commandData.aliases[0];
  // if parent, attempt to remove the parent name from the command name
  if (commandData.parent && name.startsWith(commandData.parent)) {
    name = name.substring(commandData.parent.length);
  }

  const slashCommand = commandObject
    .setName(name)
    .setDescription(commandData.description);
  // if parent command
  if (commandData.subcommands) {
    for (const subcommand of commandData.subcommands) {
      const subcommandConfig = commandConfig[subcommand];
      slashCommand.addSubcommand((subcommandBuilder) =>
        buildSingleCommand(subcommandConfig, subcommandBuilder)
      );
    }
  } else {
    for (const arg in commandData.args) {
      const argConfig = commandData.args[arg];

      const optionFn = (option) => {
        option
          .setName(arg)
          .setDescription(argConfig.description)
          .setRequired(!argConfig.optional);
        if (argConfig.enum) {
          for (const enumOption of argConfig.enum) {
            option.addChoices({
              name: enumOption.toString(),
              value: enumOption,
            });
          }
        }
        return option;
      };

      if (argConfig.type === "string") {
        slashCommand.addStringOption(optionFn);
      } else if (argConfig.type === "int") {
        slashCommand.addIntegerOption(optionFn);
      } else if (argConfig.type === "bool") {
        slashCommand.addBooleanOption(optionFn);
      } else if (argConfig.type === "user") {
        slashCommand.addUserOption(optionFn);
      } else if (argConfig.type === "channel") {
        slashCommand.addChannelOption(optionFn);
      }
    }
  }
  return slashCommand;
};
const buildSlashCommand = (commandData) => {
  // eslint-disable-next-line no-console
  console.log(commandData);
  if (commandData.parent) {
    return;
  }

  return buildSingleCommand(commandData);
};

for (const commandGroup in commandCategoryConfig) {
  const commandCategoryData = commandCategoryConfig[commandGroup];
  for (const commandName of commandCategoryData.commands) {
    const commandData = commandConfig[commandName];
    if (commandData.stages.includes(process.env.STAGE)) {
      if (!commandData.execute) {
        logger.warn(`No execute function for ${commandName}!`);
        continue;
      }
      const filePath = path.join(
        __dirname,
        "../commands",
        commandCategoryData.folder,
        commandData.execute
      );
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const commandExecute = require(filePath);
      for (const alias of commandData.aliases) {
        if (commandExecute.message) {
          messageCommands[`${alias}`] = commandExecute.message;
          commandLookup[`${alias}`] = commandData;
        } else {
          logger.warn(`No message command for ${commandName}!`);
          break;
        }
      }
      if (commandExecute.slash) {
        slashCommands[commandName] = commandExecute.slash;
      } else {
        logger.warn(`No slash command for ${commandName}!`);
      }
    }
  }
}

const getCommand = (command) => commandLookup[command];

const enumCheck = (value, enumOptions) => {
  // cast enumOptions to strings
  const enumOptionsStrings = enumOptions.map((option) => option.toString());
  return enumOptionsStrings.includes(value);
};

const validateArgs = (command, args) => {
  const calledCommandConfig = getCommand(command);
  let i = 0;
  if (calledCommandConfig) {
    for (const arg in calledCommandConfig.args) {
      // get the arg config
      const argConfig = calledCommandConfig.args[arg];

      // try to get the arg from user input
      if (args.length <= i) {
        // if arg is optional, no more input and may return true.
        // else, arg missing and return false
        if (argConfig.optional) {
          return true;
        }
        return false;
      }

      // if variable, any args are valid
      if (argConfig.variable) {
        return true;
      }

      const providedArg = args[i];

      // type check
      if (argConfig.type === "int") {
        if (isNaN(providedArg)) {
          return false;
        }
      } else if (argConfig.type === "bool") {
        if (providedArg !== "true" && providedArg !== "false") {
          return false;
        }
      } else if (argConfig.type === "user") {
        if (!providedArg.startsWith("<@") || !providedArg.endsWith(">")) {
          return false;
        }
      } else if (argConfig.type === "channel") {
        if (!providedArg.startsWith("<#") || !providedArg.endsWith(">")) {
          return false;
        }
      }

      // enum check
      if (argConfig.enum) {
        if (!enumCheck(providedArg, argConfig.enum)) {
          return false;
        }
      }

      i += 1;
    }
  }

  // if args left over, return false
  if (args.length > i) {
    return false;
  }

  return true;
};

const runMessageCommand = async (message, client) => {
  // get first two words of message
  const firstWord = message.content.split(" ")[0];
  const command = message.content.split(" ")[1];

  // if not a command, return
  if (!firstWord.startsWith(prefix)) {
    return;
  }

  try {
    const query = new QueryBuilder(collectionNames.GUILDS)
      .setFilter({ guildId: message.guildId })
      .setUpsert({
        $set: { guildId: message.guildId, lastCommand: Date.now() },
      });

    await query.upsertOne();
  } catch (err) {
    logger.warn(err);
    // pass
  }

  // if command not in commands, return
  const commandData = getCommand(command);
  if (!(command in messageCommands) || !commandData) {
    await message.reply(
      `Invalid command! Try \`${prefix} help\` to view all commands.`
    );
    return;
  }

  // validate args
  const args = message.content.split(" ").slice(2);
  if (!validateArgs(command, args)) {
    // remove command prefix
    // command = command.slice(prefix.length);
    await message.reply(
      `Invalid arguments! The correct usage is ${buildCommandUsageString(
        prefix,
        commandData
      )}. Try \`${prefix} help ${command}\` for more info.`
    );
    return;
  }

  // execute command
  try {
    // TODO: global trainer context per-interaction? seems like it would be a good idea TBH. Only issue is keeping it up-to-date
    const hasCompletedCurrentTutorialStage =
      await hasUserMetCurrentTutorialStageRequirements(message.author);
    // eslint-disable-next-line no-param-reassign
    message.content = message.content.split(" ").slice(1).join(" ");
    const res = await messageCommands[command](message, client);
    if (res && res.err) {
      return;
    }

    // add exp & money if possible
    const exp = commandLookup[`${command}`].exp || 0;
    const money = commandLookup[`${command}`].money || 0;
    if (exp > 0 || money > 0) {
      const { level, err } = await addExpAndMoney(message.author, exp, money);
      if (level && !err) {
        await attemptToReply(
          message,
          `You leveled up to level ${level}! Use \`/levelrewards\` to claim you level rewards.`
        );
      }
    }
    await sendUpsells({
      interaction: message,
      user: message.author,
      hasCompletedCurrentTutorialStage,
    });
  } catch (error) {
    logger.error(error);
    await attemptToReply(
      message,
      "There was an error trying to execute that command!"
    );
  }
};

/**
 *
 * @param {ChatInputCommandInteraction<import("discord.js").CacheType>} interaction
 * @param {Client<boolean>} client
 */
const runSlashCommand = async (interaction, client) => {
  try {
    const query = new QueryBuilder(collectionNames.GUILDS)
      .setFilter({ guildId: interaction.guildId })
      .setUpsert({
        $set: { guildId: interaction.guildId, lastCommand: Date.now() },
      });

    await query.upsertOne();
  } catch (err) {
    logger.warn(err);
    // pass
  }

  // get command name
  let command = interaction.commandName;
  // check if subcommand
  try {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand) {
      command = `${command}${subcommand}`;
    }
    if (!(command in slashCommands)) {
      command = subcommand;
    }
  } catch (err) {
    // pass
  }

  // if command not in commands, return
  if (!(command in slashCommands)) return;

  // execute command
  try {
    const hasCompletedCurrentTutorialStage =
      await hasUserMetCurrentTutorialStageRequirements(interaction.user);
    const commandData = commandLookup[`${command}`];

    const res = await slashCommands[command](interaction, client);
    removeInteractionInstance(interaction);
    if (res && res.err) {
      return;
    }

    // add exp & money if possible
    const exp = commandData.exp || 0;
    const money = commandData.money || 0;
    if (exp > 0 || money > 0) {
      const { level, err } = await addExpAndMoney(interaction.user, exp, money);
      if (level && !err) {
        await attemptToReply(
          interaction,
          `You leveled up to level ${level}! Use \`/levelrewards\` to claim you level rewards.`
        );
      }
    }
    await sendUpsells({
      interaction,
      user: interaction.user,
      hasCompletedCurrentTutorialStage,
    });
  } catch (error) {
    logger.error(error);
    await attemptToReply(
      interaction,
      "There was an error trying to execute that command!"
    );
  }
};

module.exports = {
  runMessageCommand,
  runSlashCommand,
  buildSlashCommand,
  prefix,
};
