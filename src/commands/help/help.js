const { commandConfig } = require('../../config/commandConfig');
const { stageConfig } = require('../../config/stageConfig');

const prefix = stageConfig[process.env.STAGE].prefix;

const help = async (command) => {
    // TODO: change to embed

    // if no args, send help message
    if (command == "") {
        let msg = ">>> **Help**\n\n";
        // parse command config for commands and categories
        for (const category in commandConfig) {
            msg += `\n** -- Category: ${category}** -- \n`;
            msg += `${commandConfig[category].description}\n`;
            for (const command in commandConfig[category].commands) {
                // parse args
                let argString = "";
                for (const arg in commandConfig[category].commands[command].args) {
                    const argConfig = commandConfig[category].commands[command].args[arg];
                    argString += ` <${arg}${argConfig.optional ? "?" : ""}>`;
                }

                msg += `* \`${prefix}${command}${argString}\` - ${commandConfig[category].commands[command].description}\n`;
            }
        }
        return msg;
    }

    // if args, send help message for specific command
    else {
        const providedCommand = command;
        // search through command config for alias
        for (const category in commandConfig) {
            for (const command in commandConfig[category].commands) {
                if (commandConfig[category].commands[command].aliases.includes(providedCommand)) {
                    // send help message
                    let msg = `>>> **Help for ${command}**\n\n`;
                    msg += `${commandConfig[category].commands[command].description}\n\n`;
                    msg += `**Aliases:** ${commandConfig[category].commands[command].aliases.join(", ")}\n\n`;
                    msg += `**Usage:** \`${prefix}${command} `;
                    for (const arg in commandConfig[category].commands[command].args) {
                        const argConfig = commandConfig[category].commands[command].args[arg];
                        msg += `<${arg}${argConfig.optional ? "?" : ""}> `;
                    }
                    msg += "\`\n\n";
                    msg += `**Arguments:**\n`;
                    for (const arg in commandConfig[category].commands[command].args) {
                        const argConfig = commandConfig[category].commands[command].args[arg];
                        msg += `* \`${arg}\` - ${argConfig.type} ${argConfig.optional ? "(optional)" : ""}\n`;
                    }
                    return msg;
                }
            }
        }
        return `>>> **Help for ${command}**\n\nCommand not found.`;
    }
}

const helpMessageCommand = async (message) => {
    const args = message.content.split(" ");
    args.shift();

    let command = ""
    if (args.length > 0) {
        command = args[0];
    }

    const helpMessage = await help(command);
    await message.channel.send(helpMessage);
}

const helpSlashCommand = async (interaction) => {
    const args = interaction.options._hoistedOptions;
    let command = "";
    if (args.length > 0) {
        command = args[0].value;
    }

    const helpMessage = await help(command);
    await interaction.reply(helpMessage);
}

module.exports = {
    message: helpMessageCommand,
    slash: helpSlashCommand
}
