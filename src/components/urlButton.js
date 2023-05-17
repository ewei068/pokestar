const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const buildUrlButton = (buttonConfigs) => {
    const buttons = [];
    for (const buttonConfig of buttonConfigs) {
        const button = new ButtonBuilder()
            .setLabel(buttonConfig.label)
            .setStyle(ButtonStyle.Link)
            .setURL(buttonConfig.url);
        buttons.push(button);
    }
    
    const actionRow = new ActionRowBuilder()
        .addComponents(buttons);

    return actionRow;
}

module.exports = {
    buildUrlButton
};