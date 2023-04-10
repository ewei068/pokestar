const { SlashCommandBuilder } = require('discord.js');
const { commandConfig } = require('../config/commandConfig');
const { stageNames, stageConfig } = require('../config/stageConfig');
const { addExp } = require('../utils/trainerUtils');
const { logger } = require('../log');
const fs = require('node:fs');
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
        if (argConfig.type == "string") {
            slashCommand.addStringOption(option =>
                option.setName(arg)
                    .setDescription(argConfig.description)
                    .setRequired(!argConfig.optional));
        } else if (argConfig.type == "int") {
            slashCommand.addIntegerOption(option =>
                option.setName(arg)
                    .setDescription(argConfig.description)
                    .setRequired(!argConfig.optional));
        } else if (argConfig.type == "boolean") {
            slashCommand.addBooleanOption(option =>
                option.setName(arg)
                    .setDescription(argConfig.description)
                    .setRequired(!argConfig.optional));
        }
    }
    return slashCommand;
}

for (const commandGroup in commandConfig) {
    const commandGroupConfig = commandConfig[commandGroup];
    for (const command in commandGroupConfig.commands) {
        const commandConfig = commandGroupConfig.commands[command];
        if (commandConfig.stages.includes(process.env.STAGE)) {
            const filePath = path.join(__dirname, commandGroupConfig.folder, commandConfig.execute);
            const commandExecute = require(filePath);
            for (const alias of commandConfig.aliases) {
                if (commandExecute.message) {
                    messageCommands[`${prefix}${alias}`] = commandExecute.message;
                }
                commandLookup[`${prefix}${alias}`] = commandConfig;
            }
            if (commandExecute.slash) {
                slashCommands[command] = commandExecute.slash;
            }
        }
    }
}

const getCommand = (command) => {
    return commandLookup[command];
}

const validateArgs = (command, args) => {
    const commandConfig = getCommand(command);
    let i = 0
    if (commandConfig) {
        for (const arg in commandConfig.args) {
            // get the arg config
            const argConfig = commandConfig.args[arg];

            // if variable, any args are valid
            if (argConfig.variable) {
                return true;
            }
            
            // try to get the arg from user input
            try {
                const providedArg = args[i];
            } catch (error) {
                // if arg is optional, no more input and may return true. 
                // else, arg missing and return false
                if (argConfig.optional) {
                    return true;
                } else {
                    return false;
                }
            }

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

            i++;
        }
    }

    // if args left over, return false
    if (args.length > i) {
        return false;
    }

    return true;
}
            
const runMessageCommand = async (client, message) => {
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
        await messageCommands[command](client, message);
        const exp = commandLookup[command].exp;
        if (exp && exp > 0) {
            const { level, err } = await addExp(message.author, commandLookup[command].exp);
            if (err) {
                return;
            } else if (level) {
                message.reply(`You leveled up to level ${level}!`);
            }
        }
    } catch (error) {
        logger.error(error);
        message.reply("There was an error trying to execute that command!");
    }
}

const runSlashCommand = async (interaction) => {
    // get command name
    const command = interaction.commandName;

    // if command not in commands, return
    if (!(command in slashCommands)) return;

    // execute command
    try {
        await slashCommands[command](interaction);
        const exp = commandLookup[`${prefix}${command}`].exp;
        if (exp && exp > 0) {
            const { level, err } = await addExp(interaction.user, commandLookup[`${prefix}${command}`].exp);
            if (err) {
                return;
            } else if (level) {
                // TODO: figure out better way to multi-reply to an interaction
                try {
                    await interaction.reply(`You leveled up to level ${level}!`);
                } catch (error) {
                    await interaction.channel.send(`You leveled up to level ${level}!`);
                }
            }
        }
    } catch (error) {
        logger.error(error);
        try {
            await interaction.reply("There was an error trying to execute that command!");
        } catch (error) {
            await interaction.channel.send("There was an error trying to execute that command!");
        }
    }
}

module.exports = { 
    runMessageCommand: runMessageCommand,
    runSlashCommand: runSlashCommand,
    buildSlashCommand
};
