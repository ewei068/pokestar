/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * buttonActionRow.js creates action rows for actions to be added to it.
*/
const { buildSingleButton } = require("./singleButton");
const { ActionRowBuilder, ButtonStyle } = require("discord.js");

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
const buildButtonActionRow = (buttonConfigs, eventName, danger=false) => {
    const style = danger ? ButtonStyle.Danger : (buttonConfigs.length == 1 ? ButtonStyle.Primary : ButtonStyle.Secondary);

    const actionRow = new ActionRowBuilder()
        .addComponents(buttonConfigs.map(buttonConfig => {
            const button = buildSingleButton(
                buttonConfig.label, 
                buttonConfig.emoji,
                buttonConfig.data, 
                style,
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
