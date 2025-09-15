const { buildGenericTextInputModal } = require("./genericModals");

/**
 * Builds a simple Item search modal
 * itemSearchInput is the id for the text
 * @param {object} param0
 * @param {string} param0.id
 * @param {string=} param0.title
 * @param {string=} param0.placeholder
 * @param {string=} param0.value
 * @param {boolean=} param0.required
 */
const buildItemSearchModal = ({
  id,
  title = "Search Item",
  placeholder = "Enter an Item's name",
  value,
  required = true,
}) =>
  buildGenericTextInputModal({
    id,
    textInputId: "itemSearchInput",
    title,
    label: "Item Name",
    placeholder,
    value,
    required,
  });

module.exports = {
  buildItemSearchModal,
};
