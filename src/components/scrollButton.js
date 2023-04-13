const { ButtonBuilder, ButtonStyle } = require('discord.js');

const buildScrollButton = (isLeft, data, disabled, eventName) => {
    const buttonId = {
        isLeft: isLeft,
        eventName: eventName,
        ...data,
    }

    const button = new ButtonBuilder()
        .setCustomId(`${JSON.stringify(buttonId)}`)
        .setLabel(isLeft ? 'Previous' : 'Next')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled);
    return button;
}

module.exports = {
    buildScrollButton
};