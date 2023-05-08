const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const buildUrlButton = (label, url) => {
    const button = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(label)
        .setURL(url);
    
    const actionRow = new ActionRowBuilder()
        .addComponents(button);

    return actionRow;
}

module.exports = {
    buildUrlButton
};