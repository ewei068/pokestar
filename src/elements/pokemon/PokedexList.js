const { getPokemonOrder } = require("../../utils/pokemonUtils");
const { buildDexListEmbed } = require("../../embeds/pokemonEmbeds");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { createElement, useMemo } = require("../../deact/deact");
const PokedexPokemon = require("./PokedexPokemon");
const usePaginationAndSelection = require("../../hooks/usePaginationAndSelection");
const { fuzzyMatchAll } = require("../../utils/utils");

const PAGE_SIZE = 10;

/**
 *
 * @param {import("../../deact/DeactElement").DeactElement} ref
 * @param {object} param1
 * @param {number=} param1.initialPage
 * @param {string=} param1.initialSpeciesIdOrName
 * @returns {Promise<any>}
 */
module.exports = async (
  ref,
  { initialPage = 1, initialSpeciesIdOrName = null }
) => {
  const allIds = useMemo(getPokemonOrder, [], ref); // allIds is readonly so shouldn't need to be a dependency
  // TODO: parse beforehand and error gracefully?
  const { initialSpeciesIdFound, err } = useMemo(
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
        const fuzzyMatch = fuzzyMatchAll(
          allIds,
          initialSpeciesIdOrName,
          (id) => pokemonConfig[id].name
        )[0];
        if (selectedSpeciesId) {
          initialSpeciesId = selectedSpeciesId;
        } else if (fuzzyMatch) {
          initialSpeciesId = fuzzyMatch;
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
  }

  const {
    page,
    items: ids,
    currentItem: speciesId,
    setItem: setSpeciesId,
    scrollButtonsElement,
    selectMenuElement,
  } = usePaginationAndSelection(
    {
      allItems: allIds,
      pageSize: PAGE_SIZE,
      initialPage,
      initialItem: /** @type {PokemonIdEnum} */ (initialSpeciesIdFound),
      selectionPlaceholder: "Select a Pokemon to view",
      itemConfig: pokemonConfig,
      selectionCallbackOptions: { defer: true },
      paginationCallbackOptions: { defer: false },
    },
    ref
  );

  if (speciesId) {
    return {
      elements: [createElement(PokedexPokemon, { speciesId, setSpeciesId })],
    };
  }
  return {
    elements: [
      {
        content: "",
        embeds: [buildDexListEmbed(ids, page)],
      },
    ],
    components: [scrollButtonsElement, selectMenuElement],
  };
};
