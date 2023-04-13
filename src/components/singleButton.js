const { ButtonBuilder, ButtonStyle } = require('discord.js');

const buildSingleButton = (label, data, primary, disabled, eventName) => {
    const buttonId = {
        eventName: eventName,
        ...data,
    }
    
    const button = new ButtonBuilder()
        .setCustomId(`${JSON.stringify(buttonId)}`)
        .setLabel(label)
        .setStyle(primary ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(disabled);
    return button;
}

module.exports = {
    buildSingleButton
};