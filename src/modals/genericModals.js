const { ModalBuilder } = require("discord.js");
const { buildTextInputRow } = require("./components/textInputRow");

/**
 * Builds a simple Pokemon search modal
 * pokemonSearchInput is the id for the text
 * @param {object} param0
 * @param {string} param0.id
 * @param {string=} param0.textInputId
 * @param {string} param0.title
 * @param {string} param0.label
 * @param {string=} param0.placeholder
 * @param {string=} param0.value
 * @param {boolean=} param0.required
 */
const buildGenericTextInputModal = ({
  id,
  textInputId = "textInput",
  title,
  label,
  placeholder,
  value,
  required = true,
}) => {
  const modalBuilder = new ModalBuilder().setCustomId(id).setTitle(title);

  const textInputRow = buildTextInputRow({
    id: textInputId,
    label,
    placeholder,
    value,
    required,
  });

  // @ts-ignore
  modalBuilder.addComponents(textInputRow);

  return modalBuilder;
};

module.exports = {
  buildGenericTextInputModal,
};
