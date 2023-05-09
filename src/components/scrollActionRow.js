const { ActionRowBuilder } = require('discord.js');
const { buildScrollButton } = require('./scrollButton');

const buildScrollActionRow = (page, lastPage, data, eventName) => {
    const actionRow = new ActionRowBuilder();
    const leftButton = buildScrollButton(true, data, page-1, page <= 1, eventName);
    const rightButton = buildScrollButton(false, data, page+1, lastPage, eventName);
    actionRow.addComponents(leftButton, rightButton);
    return actionRow;
}

module.exports = {
    buildScrollActionRow
};
