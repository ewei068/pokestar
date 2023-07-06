/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * backButtonRow.js is a literal backbutton for the rows.
*/
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { eventNames } = require("../config/eventConfig");

/**
 * Builds the backbutton.
 * @param {*} stateId the Id of the given state for the interactive message.
 * @returns ActionRowBuilder<AnyComponentBuilder>
 */
const buildBackButtonRow = (stateId) => {
    const buttonId = JSON.stringify({
        eventName: eventNames.BACK,
        stateId: stateId,
    });

    const backButtonRow = new ActionRowBuilder();
    const backButton = new ButtonBuilder()
        .setCustomId(buttonId)
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary);
    backButtonRow.addComponents(backButton);
    return backButtonRow;
}

module.exports = {
    buildBackButtonRow,
};