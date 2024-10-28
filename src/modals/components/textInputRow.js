const {
  TextInputStyle,
  TextInputBuilder,
  ActionRowBuilder,
} = require("discord.js");

/**
 * @param {object} param0
 * @param {string} param0.id
 * @param {string} param0.label
 * @param {string=} param0.placeholder
 * @param {string=} param0.value
 * @param {TextInputStyle=} param0.style
 * @param {boolean=} param0.required
 */
const buildTextInputRow = ({
  id,
  label,
  placeholder,
  value,
  style = TextInputStyle.Short,
  required = false,
}) => {
  const textInputComponent = new TextInputBuilder()
    .setCustomId(id)
    .setLabel(label)
    .setStyle(style)
    .setRequired(required);

  if (placeholder) {
    textInputComponent.setPlaceholder(placeholder);
  }
  if (value) {
    textInputComponent.setValue(value);
  }

  return new ActionRowBuilder().addComponents(textInputComponent);
};

module.exports = {
  buildTextInputRow,
};
