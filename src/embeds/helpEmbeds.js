const { EmbedBuilder } = require('discord.js');
const { commandConfig, commandCategoryConfig } = require('../config/commandConfig');
const { stageConfig } = require('../config/stageConfig');
const { buildCommandUsageString } = require('../utils/utils');

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
    return embed;
}

module.exports = {
    buildHelpEmbed,
    buildHelpCategoryEmbed,
    buildHelpCommandEmbed
}