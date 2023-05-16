const { ButtonBuilder, ButtonStyle } = require('discord.js');

const buildSingleButton = (label, emoji, data, primary, disabled, eventName) => {
    const buttonId = {
        eventName: eventName,
        ...data,
    }
    
    const button = new ButtonBuilder()
        .setCustomId(`${JSON.stringify(buttonId)}`)
        .setStyle(primary ? ButtonStyle.Primary : ButtonStyle.Secondary)
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