const { buildSingleButton } = require("./singleButton");
const { ActionRowBuilder } = require("discord.js");

// buttonConfigs = [{
//  label,
//  disabled 
//  ...
// }]
/**
 * 
 * @param {*} buttonConfigs buttonConfigs = [{
 *  label?,
 *  disabled,
 *  data,
 *  emoji?
 * }]
 * @param {*} eventName 
 * @returns 
 */
const buildButtonActionRow = (buttonConfigs, eventName) => {

    let primary = buttonConfigs.length === 1;

    const actionRow = new ActionRowBuilder()
        .addComponents(buttonConfigs.map(buttonConfig => {
            const button = buildSingleButton(
                buttonConfig.label, 
                buttonConfig.emoji,
                buttonConfig.data, 
                primary, 
                buttonConfig.disabled, 
                eventName
            );
            return button;
        }));

    return actionRow;
}

module.exports = {
    buildButtonActionRow
};
