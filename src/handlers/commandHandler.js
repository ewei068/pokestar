/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * commandHandler.js handles all commands and command types the user can use.
*/
const { SlashCommandBuilder } = require('discord.js');
const { commandCategoryConfig, commandConfig } = require('../config/commandConfig');
const { stageNames, stageConfig } = require('../config/stageConfig');
const { addExpAndMoney: addExpAndMoney } = require('../services/trainer');
const { logger } = require('../log');
const path = require('node:path');
const { buildCommandUsageString } = require('../utils/utils');
const { QueryBuilder } = require('../database/mongoHandler');
const { collectionNames } = require('../config/databaseConfig');

const prefix = stageConfig[process.env.STAGE].prefix;

const messageCommands = {};
const slashCommands = {}
const commandLookup = {};

const buildSlashCommand = (commandConfig) => {
    const slashCommand = new SlashCommandBuilder()
        .setName(commandConfig.aliases[0])
        .setDescription(commandConfig.description);
    for (const arg in commandConfig.args) {
        const argConfig = commandConfig.args[arg];

        const optionFn = (option) => {
            option.setName(arg)
                .setDescription(argConfig.description)
                .setRequired(!argConfig.optional);
            if (argConfig.enum) {
                for (const enumOption of argConfig.enum) {
                    option.addChoices({
                        name: enumOption.toString(),
                        value: enumOption
                    });
                }
            }
            return option;
        }

        if (argConfig.type == "string") {
            slashCommand.addStringOption(optionFn);
        } else if (argConfig.type == "int") {
            slashCommand.addIntegerOption(optionFn);
        } else if (argConfig.type == "bool") {
            slashCommand.addBooleanOption(optionFn);
        } else if (argConfig.type == "user") {
            slashCommand.addUserOption(optionFn);
        }
    }
    return slashCommand;
}

for (const commandGroup in commandCategoryConfig) {
    const commandCategoryData = commandCategoryConfig[commandGroup];
    for (const commandName of commandCategoryData.commands) {
        const commandData = commandConfig[commandName];
        if (commandData.stages.includes(process.env.STAGE)) {
            const filePath = path.join(__dirname, "../commands", commandCategoryData.folder, commandData.execute);
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

const getCommand = (command) => {
    return commandLookup[command];
}

const enumCheck = (value, enumOptions) => {
    // cast enumOptions to strings
    enumOptions = enumOptions.map(option => option.toString());
    return enumOptions.includes(value);
}

const validateArgs = (command, args) => {
    const commandConfig = getCommand(command);
    let i = 0
    if (commandConfig) {
        for (const arg in commandConfig.args) {
            // get the arg config
            const argConfig = commandConfig.args[arg];
            
            // try to get the arg from user input
            if (args.length <= i) {
                // if arg is optional, no more input and may return true. 
                // else, arg missing and return false
                if (argConfig.optional) {
                    return true;
                } else {
                    return false;
                }
            }

            // if variable, any args are valid
            if (argConfig.variable) {
                return true;
            }

            const providedArg = args[i];

            // type check
            if (argConfig.type == "int") {
                if (isNaN(providedArg)) {
                    return false;
                }
            } else if (argConfig.type == "bool") {
                if (providedArg != "true" && providedArg != "false") {
                    return false;
                }
            } else if (argConfig.type == "user") {
                if (!providedArg.startsWith("<@") || !providedArg.endsWith(">")) {
                    return false;
                }
            }

            // enum check
            if (argConfig.enum) {
                if (!enumCheck(providedArg, argConfig.enum)) {
                    return false;
                }
            }

            i++;
        }
    }

    // if args left over, return false
    if (args.length > i) {
        return false;
    }

    return true;
}
            
const runMessageCommand = async (message, client) => {
    // console.log(message.content)
    // console.log(message.content.split(" "));

    // get first two words of message
    let firstWord = message.content.split(" ")[0];
    let command = message.content.split(" ")[1];

    // if not a command, return
    if (!firstWord.startsWith(prefix)) {
        return;
    }

    try {
        const query = new QueryBuilder(collectionNames.GUILDS)
            .setFilter({ guildId: message.guildId })
            .setUpsert({ $set: { guildId: message.guildId, lastCommand: Date.now() }});

        await query.upsertOne();
    } catch (err) {
        logger.warn(err);
        // pass
    }

    // if command not in commands, return
    const commandData = getCommand(command);
    if (!(command in messageCommands) || !commandData) {
        message.reply(`Invalid command! Try \`${prefix} help\` to view all commands.`);
        return;
    }

    // validate args
    const args = message.content.split(" ").slice(2);
    if (!validateArgs(command, args)) {
        // remove command prefix
        // command = command.slice(prefix.length);
        await message.reply(`Invalid arguments! The correct usage is ${buildCommandUsageString(prefix, commandData)}. Try \`${prefix} help ${command}\` for more info.`);
        return;
    }

    // execute command
    try {
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
            if (err) {
                return;
            } else if (level) {
                await message.reply(`You leveled up to level ${level}! Use \`/levelrewards\` to claim you level rewards.`);
            }
        }
    } catch (error) {
        logger.error(error);
        await message.reply("There was an error trying to execute that command!");
    }
}

const runSlashCommand = async (interaction, client) => {
    try {
        const query = new QueryBuilder(collectionNames.GUILDS)
            .setFilter({ guildId: interaction.guildId })
            .setUpsert({ $set: { guildId: interaction.guildId, lastCommand: Date.now() }});

        await query.upsertOne();
    } catch (err) {
        logger.warn(err);
        // pass
    }

    // get command name
    const command = interaction.commandName;

    // if command not in commands, return
    if (!(command in slashCommands)) return;

    // execute command
    try {
        const res = await slashCommands[command](interaction, client);
        if (res && res.err) {
            return;
        }

        // add exp & money if possible
        const exp = commandLookup[`${command}`].exp || 0;
        const money = commandLookup[`${command}`].money || 0;
        if (exp > 0 || money > 0) {
            const { level, err } = await addExpAndMoney(interaction.user, exp, money);
            if (err) {
                return;
            } else if (level) {
                try {
                    await interaction.reply(`You leveled up to level ${level}! Use \`/levelrewards\` to claim you level rewards.`);
                } catch (error) {
                    await interaction.followUp(`You leveled up to level ${level}! Use \`/levelrewards\` to claim you level rewards.`);
                }
            }
        }
    } catch (error) {
        logger.error(error);
        try {
            await interaction.reply("There was an error trying to execute that command!");
        } catch (error) {
            await interaction.followUp("There was an error trying to execute that command!");
        }
    }
}

module.exports = { 
    runMessageCommand: runMessageCommand,
    runSlashCommand: runSlashCommand,
    buildSlashCommand,
    prefix
};
