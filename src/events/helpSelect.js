const { commandCategoryConfig, commandConfig } = require("../config/commandConfig");
const { buildHelpCategoryEmbed, buildHelpCommandEmbed } = require("../embeds/helpEmbeds");
const { getState } = require("../services/state");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { buildBackButtonRow } = require("../components/backButtonRow");
const { eventNames } = require("../config/eventConfig");

const helpSelect = async (interaction, data) => {
    // get state
    const state = getState(data.stateId);
    if (!state) {
        await interaction.update({ 
            content: "This interaction has expired.",
            components: [] 
        });
        return { err: "This interaction has expired." };
    }

    // if data has userId component, verify interaction was done by that user
    if (state.userId && interaction.user.id !== state.userId) {
        return { err: "This interaction was not initiated by you." };
    }


    // get which select menu was used
    const select = data.select;

    // get which option was selected
    const option = interaction.values[0];

    const send = {
        embeds: [],
        components: []
    }
    // if select is category, update embed to selected category
    if (select === "category") {
        const embed = buildHelpCategoryEmbed(option);
        send.embeds.push(embed);
        
        const categorySelectRowData = {
            stateId: data.stateId,
            select: "command"
        }
        const categorySelectRow = buildIdConfigSelectRow(
            // only get commands in current deployment stage
            commandCategoryConfig[option].commands.filter(command => commandConfig[command].stages.includes(process.env.STAGE)),
            commandConfig,
            "Select a command:",
            categorySelectRowData,
            eventNames.HELP_SELECT,
            false
        )
        send.components.push(categorySelectRow);
    } else if (select === "command") {
        // if select is command, update embed to selected command
        const embed = buildHelpCommandEmbed(option);
        send.embeds.push(embed);
    }

    // get back button
    const backButton = buildBackButtonRow(data.stateId);
    send.components.push(backButton);

    state.messageStack.push(send);

    await interaction.update(send);
}

module.exports = helpSelect;