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
 *  label,
 *  disabled,
 *  data
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
