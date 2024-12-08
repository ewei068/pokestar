const { createElement, useMemo } = require("../../deact/deact");
const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const { commandCategoryConfig } = require("../../config/commandConfig");
const { buildHelpEmbed } = require("../../embeds/helpEmbeds");

const PAGE_SIZE = 10;

/**
 *
 * @param {import("../../deact/DeactElement").DeactElement} ref
 * @param {object} param1
 * @param {number=} param1.initialPage
 * @param {string=} param1.initialCommand
 * @returns {Promise<any>}
 */
module.exports = async (ref, { initialPage = 1, initialCommand = null }) => {
  const allCategories = useMemo(
    () => Object.keys(commandCategoryConfig),
    [],
    ref
  ); // readonly
  // TODO: parse beforehand and error gracefully?
  // TODO:
  // Parse intial category from initial command
  // Pass in initial command as props
  /* const { initialSpeciesIdFound, err } = useMemo(
    () => {
      let initialSpeciesId = initialSpeciesIdOrName;
      if (
        initialSpeciesIdOrName !== null &&
        pokemonConfig[initialSpeciesIdOrName] === undefined
      ) {
        // if ID undefined, check all species for name match
        const selectedSpeciesId = allIds.find(
          (foundSpeciesId) =>
            pokemonConfig[foundSpeciesId].name.toLowerCase() ===
            initialSpeciesIdOrName.toLowerCase()
        );
        if (selectedSpeciesId) {
          initialSpeciesId = selectedSpeciesId;
        } else {
          return {
            initialSpeciesIdFound: null,
            err: "Invalid Pokemon species or Pokemon not added yet!",
          };
        }
      }

      return { initialSpeciesIdFound: initialSpeciesId, err: null };
    },
    [],
    ref
  );
  if (err) {
    return {
      err,
    };
  } */

  const {
    page,
    items: categoryIds,
    currentItem: categoryId,
    setItem: setCategoryId,
    scrollButtonsElement,
    selectMenuElement,
  } = usePaginationAndSelection(
    {
      allItems: allCategories,
      pageSize: PAGE_SIZE,
      initialPage,
      // initialItem: initialCategory,
      selectionPlaceholder: "Select a command category:",
      itemConfig: commandCategoryConfig,
      selectionCallbackOptions: { defer: false },
      paginationCallbackOptions: { defer: false },
    },
    ref
  );

  return {
    elements: [
      {
        content: "",
        embeds: [buildHelpEmbed(categoryIds)],
      },
    ],
    components: [scrollButtonsElement, selectMenuElement],
  };
};
