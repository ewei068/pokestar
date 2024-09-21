/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * yesNoActionRow.js Creates an action row using discordjs's ActionRowBuilder for Yes/No options.
*/
const { ActionRowBuilder } = require('discord.js');
const { buildYesNoButton } = require('./yesNoButton');

/**
 * Creates an action row using discordjs's ActionRowBuilder for Yes/No options.
 * @param {*} data the data for the button.
 * @param {*} eventName the name of the event the button calls.
 * @param {*} danger danger Will Robinson. set to false.
 * @returns ActionRowBuilder
 */
const buildYesNoActionRow = (data, eventName, danger = false) => {
    const actionRow = new ActionRowBuilder();
    const yesButton = buildYesNoButton(true, data, eventName, danger);
    const noButton = buildYesNoButton(false, data, eventName, danger);
    actionRow.addComponents(yesButton, noButton);
    return actionRow;
}

module.exports = {
    buildYesNoActionRow
};