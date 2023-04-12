const { ActionRowBuilder } = require('discord.js');
const { buildYesNoButton } = require('./yesNoButton');

const buildYesNoActionRow = (data, eventName, danger=false) => {
    const actionRow = new ActionRowBuilder();
    const yesButton = buildYesNoButton(true, data, eventName, danger);
    const noButton = buildYesNoButton(false, data, eventName, danger);
    actionRow.addComponents(yesButton, noButton);
    return actionRow;
}

module.exports = {
    buildYesNoActionRow
};