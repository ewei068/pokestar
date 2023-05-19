const { EmbedBuilder } = require('discord.js');
const { commandConfig, commandCategoryConfig } = require('../config/commandConfig');
const { stageConfig } = require('../config/stageConfig');
const { buildCommandUsageString } = require('../utils/utils');
const { buildIdConfigSelectRow } = require('../components/idConfigSelectRow');
const { buildBackButtonRow } = require('../components/backButtonRow');
const { getState } = require('../services/state');
const { eventNames } = require('../config/eventConfig');

const prefix = stageConfig[process.env.STAGE].prefix;

// help for no command name (show categories and descriptions)
const buildHelpEmbed = () => {
    let categoriesString = "";
    for (const commandCategory in commandCategoryConfig) {
        const commandCategoryData = commandCategoryConfig[commandCategory];
        categoriesString += `**${commandCategoryData.name}** - ${commandCategoryData.description}\n`;
    }
    const embed = new EmbedBuilder();
    embed.setTitle("Help")
    embed.setColor("#FFFFFF")
    embed.setDescription("Use the selection menu to learn more about a command!")
    embed.addFields(
        { name: "Categories", value: categoriesString, inline: true }
    );
    embed.setFooter({ text: `If you're just starting, please take the /tutorial!` });
    return embed;
}

const buildHelpCategoryEmbed = (category) => {
    let commandsString = "";
    for (const commandName of commandCategoryConfig[category].commands) {
        const commandData = commandConfig[commandName];
        if (!commandData.stages.includes(process.env.STAGE)) {
            continue;
        }

        commandsString += buildCommandUsageString(prefix, commandData);
        commandsString += ` - ${commandData.description}\n`;
    }
    const embed = new EmbedBuilder();
    embed.setTitle(`Help - ${commandCategoryConfig[category].name}`)
    embed.setColor("#FFFFFF")
    embed.setDescription("Use the selection menu to learn more about a command!")
    embed.addFields(
        { name: "Commands", value: commandsString, inline: true }
    );
    embed.setFooter({ text: `If you're just starting, please take the /tutorial!` });
    return embed;
}

const buildHelpCommandEmbed = (commandName) => {
    const commandData = commandConfig[commandName];

    const usageString = buildCommandUsageString(prefix, commandData)

    let argsString = "";
    for (const arg in commandData.args) {
        const argConfig = commandData.args[arg];
        argsString += `\`${arg}: ${argConfig.type}${argConfig.optional ? "?" : ""}\` - ${argConfig.description}\n`;
        if (argConfig.enum) {
            argsString += `--**Choices:** \`${argConfig.enum.join("`, `")}\`\n`;
        }
    }
    if (argsString == "") {
        argsString = "None";
    }

    const embed = new EmbedBuilder();
    embed.setTitle(`Help - ${commandData.aliases[0]}`)
    embed.setColor("#FFFFFF")
    embed.setDescription(commandData.longDescription || commandData.description)
    embed.addFields(
        { name: "Aliases", value: `\`${commandData.aliases.join("`, `")}\``, inline: false },
        { name: "Usage", value: usageString, inline: false },
        { name: "Arguments", value: argsString, inline: false }
    );
    embed.setFooter({ text: `If you're just starting, please take the /tutorial!` });
    return embed;
}

const buildHelpSend = async ({ stateId=null, view="help", option=null, back=true } = {}) => {
    const state = getState(stateId);

    const send = {
        embeds: [],
        components: []
    }
    if (view === "help") {
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

        send.embeds.push(buildHelpEmbed());
        send.components.push(categorySelectRow);
    } else if (view === "category") {
        // if select is category, update embed to selected category
        const embed = buildHelpCategoryEmbed(option);
        send.embeds.push(embed);
        
        const categorySelectRowData = {
            stateId: stateId,
            select: "command"
        }
        const categorySelectRow = buildIdConfigSelectRow(
            // only get commands in current deployment stage
            commandCategoryConfig[option].commands.filter(
                command => commandConfig[command].stages.includes(process.env.STAGE)
            ),
            commandConfig,
            "Select a command:",
            categorySelectRowData,
            eventNames.HELP_SELECT,
            false
        )
        send.components.push(categorySelectRow);
        // get back button
        const backButton = buildBackButtonRow(stateId);
        send.components.push(backButton);
    } else if (view === "command") {
        // if select is command, update embed to selected command
        const embed = buildHelpCommandEmbed(option);
        send.embeds.push(embed);
        // get back button
        const backButton = buildBackButtonRow(stateId);
        send.components.push(backButton);
    }

    if (back) {
        // add state to stack for back button
        state.messageStack.push({
            execute: buildHelpSend,
            args: {
                stateId: stateId,
                view: view,
                option: option,
                back: false
            }
        });
    }
    
    return { send: send, err: null };
}

module.exports = {
    buildHelpEmbed,
    buildHelpCategoryEmbed,
    buildHelpCommandEmbed,
    buildHelpSend
}