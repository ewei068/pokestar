const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { eventNames } = require("../config/eventConfig");

const buildBackButtonRow = (stateId) => {
    const buttonId = JSON.stringify({
        eventName: eventNames.BACK,
        stateId: stateId,
    });

    const backButtonRow = new ActionRowBuilder();
    const backButton = new ButtonBuilder()
        .setCustomId(buttonId)
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary);
    backButtonRow.addComponents(backButton);
    return backButtonRow;
}

module.exports = {
    buildBackButtonRow,
};