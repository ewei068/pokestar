const commandConfig = require('../config/commandConfig');
const { stageNames, stageConfig } = require('../config/stageConfig');
const fs = require('node:fs');
const path = require('node:path');

const prefix = stageConfig[process.env.STAGE].prefix;

const commands = {};
const commandLookup = {};

for (const commandGroup in commandConfig) {
    const commandGroupConfig = commandConfig[commandGroup];
    for (const command in commandGroupConfig.commands) {
        const commandConfig = commandGroupConfig.commands[command];
        if (commandConfig.stages.includes(process.env.STAGE)) {
            const filePath = path.join(__dirname, commandGroupConfig.folder, commandConfig.execute);
            const commandExecute = require(filePath);
            for (const alias of commandConfig.aliases) {
                commands[`${prefix}${alias}`] = commandExecute;
                commandLookup[`${prefix}${alias}`] = commandConfig;
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
            
const runCommand = async (client, message) => {
    // get first word of message
    let command = message.content.split(" ")[0];

    // if command doesn't start with prefix or not in commands, return
    if (!command.startsWith(prefix) || !(command in commands)) return;

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
        await commands[command](client, message);
    } catch (error) {
        console.error(error);
        message.reply("There was an error trying to execute that command!");
    }
}

module.exports = { runCommand };
