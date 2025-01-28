const { buildGenericTextInputModal } = require("./genericModals");

/**
 * Builds a simple Pokemon search modal
 * pokemonSearchInput is the id for the text
 * @param {object} param0
 * @param {string} param0.id
 * @param {string=} param0.title
 * @param {string=} param0.placeholder
 * @param {string=} param0.value
 * @param {boolean=} param0.required
 */
const buildPokemonSearchModal = ({
  id,
  title = "Search Pokemon",
  placeholder = "Enter a Pokemon's name",
  value,
  required = true,
}) =>
  buildGenericTextInputModal({
    id,
    textInputId: "pokemonSearchInput",
    title,
    label: "Pokemon Name",
    placeholder,
    value,
    required,
  });

/**
 * Builds a simple Pokemon ID search modal
 * pokemonIdInput is the id for the text
 * @param {object} param0
 * @param {string} param0.id
 * @param {string=} param0.title
 * @param {string=} param0.placeholder
 * @param {string=} param0.value
 * @param {boolean=} param0.required
 */
const buildPokemonIdSearchModal = ({
  id,
  title = "Select Pokemon",
  placeholder = "Enter a Pokemon's exact ID",
  value,
  required = true,
}) =>
  buildGenericTextInputModal({
    id,
    textInputId: "pokemonIdInput",
    title,
    label: "Pokemon ID",
    placeholder,
    value,
    required,
  });

module.exports = {
  buildPokemonSearchModal,
  buildPokemonIdSearchModal,
};
