/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * helpEmbeds.js Handles all of the embeded options for help.
*/
const { EmbedBuilder } = require('discord.js');
const { commandConfig, commandCategoryConfig } = require('../config/commandConfig');
const { stageConfig } = require('../config/stageConfig');
const { buildCommandUsageString } = require('../utils/utils');
const { buildIdConfigSelectRow } = require('../components/idConfigSelectRow');
const { buildBackButtonRow } = require('../components/backButtonRow');
const { getState } = require('../services/state');
const { eventNames } = require('../config/eventConfig');
const { gameEventConfig, tutorialConfig } = require('../config/helpConfig');
const { buildScrollActionRow } = require('../components/scrollActionRow');

const prefix = stageConfig[process.env.STAGE].prefix;

/**
 * help for no command name (show categories and descriptions)
 * @returns an embeded
 */
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
/**
 * Builds an embeded section for a selected category.
 * @param {*} category the category to add to the help.
 * @returns an embed
 */
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

const buildEventEmbed = (eventData) => {
    const embed = new EmbedBuilder();
    embed.setTitle(`[Event] ${eventData.name}`)
    embed.setColor("#FFFFFF")
    embed.setDescription(eventData.description)
    embed.setFooter({ text: `If you're just starting, please take the /tutorial!` });

    if (eventData.image) {
        embed.setImage(eventData.image);
    }

    return embed;
}

const buildTutorialEmbed = (tutorialData, pageNumber) => {
    const embed = new EmbedBuilder();
    embed.setTitle(`${tutorialData.name}`)
    embed.setColor("#FFFFFF")
    embed.setDescription(tutorialData.description)
    embed.setFooter({ text: `Page ${pageNumber} | To return to this page, use /tutorial ${pageNumber}` });

    if (tutorialData.image) {
        embed.setImage(tutorialData.image);
    }

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

const buildEventsSend = async ({ page=1 } = {}) => {
    const events = gameEventConfig;
    const index = page - 1;
    if (index < 0 || index >= events.length) {
        return { send: null, err: "Invalid event page." };
    }

    const send = {
        embeds: [],
        components: []
    }

    const eventData = events[index];
    const embed = buildEventEmbed(eventData);
    send.embeds.push(embed);

    // build scroll row
    const scrollData = {
    }
    const scrollActionRow = buildScrollActionRow(
        // page = index of id + 1
        index + 1,
        index >= events.length - 1 ? true : false,
        scrollData,
        eventNames.EVENT_BUTTON
    )
    send.components.push(scrollActionRow);

    return { send: send, err: null };
}

const buildTutorialSend = async ({ page=1 } = {}) => {
    const tutorialPages = tutorialConfig;
    const index = page - 1;
    if (index < 0 || index >= tutorialPages.length) {
        return { send: null, err: "Invalid tutorial page." };
    }

    const send = {
        embeds: [],
        components: []
    }

    const tutorialData = tutorialPages[index];
    const embed = buildTutorialEmbed(tutorialData, page);
    send.embeds.push(embed);

    // build scroll row
    const scrollData = {
    }
    const scrollActionRow = buildScrollActionRow(
        // page = index of id + 1
        index + 1,
        index >= tutorialPages.length - 1 ? true : false,
        scrollData,
        eventNames.TUTORIAL_BUTTON
    )
    send.components.push(scrollActionRow);

    return { send: send, err: null };
}

module.exports = {
    buildHelpEmbed,
    buildHelpCategoryEmbed,
    buildHelpCommandEmbed,
    buildHelpSend,
    buildEventsSend,
    buildTutorialSend
}