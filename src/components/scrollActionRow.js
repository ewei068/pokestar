const { ActionRowBuilder } = require('discord.js');
const { buildScrollButton } = require('./scrollButton');

const buildScrollActionRow = (page, lastPage, eventName) => {
    const actionRow = new ActionRowBuilder();
    const leftButton = buildScrollButton(page, true, page <= 1, eventName);
    const rightButton = buildScrollButton(page, false, lastPage, eventName);
    actionRow.addComponents(leftButton, rightButton);
    return actionRow;
}

module.exports = {
    buildScrollActionRow
};
