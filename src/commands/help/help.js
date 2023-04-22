const { buildIdConfigSelectRow } = require('../../components/idConfigSelectRow');
const { commandConfig, commandCategoryConfig } = require('../../config/commandConfig');
const { eventNames } = require('../../config/eventConfig');
const { stageConfig } = require('../../config/stageConfig');
const { buildHelpEmbed, buildHelpCommandEmbed } = require('../../embeds/helpEmbeds');
const { setState, getState } = require('../../services/state');

const prefix = stageConfig[process.env.STAGE].prefix;

const help = async (command) => {
    // TODO: change to embed

    // if no args, send help message
    if (command == "") {
        const stateId = setState({
            messageStack: []
        }, ttl=150);
        const categorySelectRowData = {
            stateId: stateId,
            select: "category"
        }
        const categorySelectRow = buildIdConfigSelectRow(
            Object.keys(commandCategoryConfig),
            commandCategoryConfig,
            "Select a category:",
            categorySelectRowData,
            eventNames.HELP_SELECT,
            false
        )
        const send = {
            embeds: [buildHelpEmbed()],
            components: [categorySelectRow]
        }
        
        getState(stateId).messageStack.push(send);
        
        return send;
    }

    // if args, send help message for specific command
    else {
        const providedCommand = command;
        // search through command config for alias
        for (const commandName in commandConfig) {
            const commandData = commandConfig[commandName];
            if (commandData.aliases.includes(providedCommand) && commandData.stages.includes(process.env.STAGE)) {
                // send help message
                return { embeds: [buildHelpCommandEmbed(commandData.aliases[0])] };
            }
        }
        return `Command \`${command}\` not found.`;
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
    const command = interaction.options.getString('command') || "";

    const helpMessage = await help(command);
    await interaction.reply(helpMessage);
}

module.exports = {
    message: helpMessageCommand,
    slash: helpSlashCommand
}
