const { buildSingleButton } = require("./singleButton");
const { ActionRowBuilder } = require("discord.js");

// buttonConfigs = [{
//  label,
//  disabled 
//  ...
// }]
const buildButtonActionRow = (buttonConfigs, data, eventName) => {

    let primary = buttonConfigs.length === 1;

    const actionRow = new ActionRowBuilder()
        .addComponents(buttonConfigs.map(buttonConfig => {
            const button = buildSingleButton(
                buttonConfig.label, 
                data, 
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
