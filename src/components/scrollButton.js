const { ButtonBuilder, ButtonStyle } = require('discord.js');

const buildScrollButton = (isLeft, data, page, disabled, eventName) => {
    const buttonId = {
        page: page,
        eventName: eventName,
        ...data,
    }

    const button = new ButtonBuilder()
        .setCustomId(`${JSON.stringify(buttonId)}`)
        .setLabel(isLeft ? '◄' : '►')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled);
    return button;
}

module.exports = {
    buildScrollButton
};