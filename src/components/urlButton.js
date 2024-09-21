/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * urlButton.js Creates a button for a link using discordjs's ButtonBuilder.
*/
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

/**
 * Creates a button for a link using discordjs's ButtonBuilder.
 * @param {*} buttonConfigs the configs for the button.
 * @returns ButtonBuilder.
 */
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