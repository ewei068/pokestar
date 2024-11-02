const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { makeComponentIdWithStateId } = require("../deact/deact");

const buildDeactLegacyReturnButton = ({
  stateId,
  callbackBindingKey,
  label = "Return",
  data = {},
  buttonStyle = ButtonStyle.Primary,
}) => {
  const customId = makeComponentIdWithStateId(
    stateId,
    callbackBindingKey,
    data
  );
  const actionRow = new ActionRowBuilder();
  const button = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(buttonStyle)
    .setDisabled(false);
  actionRow.addComponents(button);
  return actionRow;
};

module.exports = buildDeactLegacyReturnButton;
