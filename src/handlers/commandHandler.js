const { SlashCommandBuilder } = require('discord.js');
const { commandConfig } = require('../config/commandConfig');
const { stageNames, stageConfig } = require('../config/stageConfig');
const { addExpAndMoney: addExpAndMoney } = require('../services/trainer');
const { logger } = require('../log');
const path = require('node:path');

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
                        name: enumOption,
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
        } else if (argConfig.type == "boolean") {
            slashCommand.addBooleanOption(optionFn);
        }
    }
    return slashCommand;
}

for (const commandGroup in commandConfig) {
    const commandGroupConfig = commandConfig[commandGroup];
    for (const command in commandGroupConfig.commands) {
        const commandConfig = commandGroupConfig.commands[command];
        if (commandConfig.stages.includes(process.env.STAGE)) {
            const filePath = path.join(__dirname, "../commands", commandGroupConfig.folder, commandConfig.execute);
            const commandExecute = require(filePath);
            for (const alias of commandConfig.aliases) {
                if (commandExecute.message) {
                    messageCommands[`${prefix}${alias}`] = commandExecute.message;
                } else {
                    logger.warn(`No message command for ${command}!`);
                    break;
                }
                commandLookup[`${prefix}${alias}`] = commandConfig;
            }
            if (commandExecute.slash) {
                slashCommands[command] = commandExecute.slash;
            } else {
                logger.warn(`No slash command for ${command}!`);
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
            } else if (argConfig.type == "boolean") {
                if (providedArg != "true" && providedArg != "false") {
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
    // get first word of message
    let command = message.content.split(" ")[0];

    // if not a command, return
    if (!command.startsWith(prefix)) return;

    // if command not in commands, return
    if (!(command in messageCommands)) {
        message.reply(`Invalid command! Try \`${prefix}help\` for more info.`);
        return;
    }

    // validate args
    const args = message.content.split(" ").slice(1);
    if (!validateArgs(command, args)) {
        // remove command prefix
        command = command.slice(prefix.length);
        message.reply(`Invalid arguments! Try \`${prefix}help ${command}\` for more info.`);
        return;
    }

    // execute command
    try {
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
                message.reply(`You leveled up to level ${level}! Use \`/levelrewards\` to claim you level rewards.`);
            }
        }
    } catch (error) {
        logger.error(error);
        message.reply("There was an error trying to execute that command!");
    }
}

const runSlashCommand = async (interaction, client) => {
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
        const exp = commandLookup[`${prefix}${command}`].exp || 0;
        const money = commandLookup[`${prefix}${command}`].money || 0;
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
