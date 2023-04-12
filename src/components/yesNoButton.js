const { ButtonBuilder, ButtonStyle } = require('discord.js');

const buildYesNoButton = (yes, data, eventName, danger=false) => {
    const buttonId = JSON.stringify({
        yes: yes,
        eventName: eventName,
        ...data,
    });

    let buttonSyle = ButtonStyle.Secondary;
    if (danger && yes) {
        buttonSyle = ButtonStyle.Danger;
    } else if (yes) {
        buttonSyle = ButtonStyle.Success;
    }

    const button = new ButtonBuilder()
        .setCustomId(buttonId)
        .setLabel(yes ? 'Yes' : 'No')
        .setStyle(buttonSyle);

    return button;
}

module.exports = {
    buildYesNoButton
};