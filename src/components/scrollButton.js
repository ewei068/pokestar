const { ButtonBuilder, ButtonStyle } = require('discord.js');

const buildScrollButton = (page, isLeft, disabled, eventName) => {
    const buttonId = {
        page: page,
        isLeft: isLeft,
        eventName: eventName
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