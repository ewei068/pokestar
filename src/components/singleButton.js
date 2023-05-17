const { ButtonBuilder } = require('discord.js');

const buildSingleButton = (label, emoji, data, style, disabled, eventName) => {
    const buttonId = {
        eventName: eventName,
        ...data,
    }
    
    const button = new ButtonBuilder()
        .setCustomId(`${JSON.stringify(buttonId)}`)
        .setStyle(style)
        .setDisabled(disabled);
    if (label) {
        button.setLabel(label);
    }
    if (emoji) {
        button.setEmoji(emoji);
    }
    return button;
}

module.exports = {
    buildSingleButton
};