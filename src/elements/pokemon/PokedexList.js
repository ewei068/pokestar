const { getPokemonOrder } = require("../../utils/pokemonUtils");
const { buildDexListEmbed } = require("../../embeds/pokemonEmbeds");
const { pokemonConfig } = require("../../config/pokemonConfig");
const {
  useState,
  useCallbackBinding,
  createElement,
  useEffect,
} = require("../../deact/deact");
const ScrollButtons = require("../foundation/ScrollButtons");
const IdConfigSelectMenu = require("../foundation/IdConfigSelectMenu");
const PokedexPokemon = require("./PokedexPokemon");

const PAGE_SIZE = 10;

/**
 *
 * @param {import("../../deact/DeactElement").DeactElement} ref
 * @param {object} param1
 * @param {number=} param1.initialPage
 * @param {string=} param1.initialSpeciesId
 * @returns {Promise<any>}
 */
module.exports = async (ref, { initialPage = 1, initialSpeciesId = null }) => {
  const [speciesId, setSpeciesId] = useState(initialSpeciesId, ref);
  const [page, setPage] = useState(initialPage, ref);
  const allIds = getPokemonOrder(); // allIds is readonly so shouldn't need to be a dependency
  if (page < 1 || page > Math.ceil(allIds.length / PAGE_SIZE)) {
    return { send: null, err: "Invalid page number." };
  }

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const ids = allIds.slice(start, end);

  useEffect(
    () => {
      if (speciesId) {
        const index = allIds.indexOf(speciesId);
        setPage(Math.ceil((index + 1) / PAGE_SIZE));
      }
    },
    [speciesId, setPage],
    ref
  );

  const callbackOptions = { defer: false };
  const prevActionBindng = useCallbackBinding(
    () => {
      setPage(page - 1);
    },
    ref,
    callbackOptions
  );
  const nextActionBindng = useCallbackBinding(
    () => {
      setPage(page + 1);
    },
    ref,
    callbackOptions
  );
  const onSpeciesSelectKey = useCallbackBinding(
    (interaction) => {
      // @ts-ignore ts is stupid
      const id = interaction?.values?.[0];
      setSpeciesId(id);
    },
    ref,
    callbackOptions
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
    components: [
      createElement(ScrollButtons, {
        onPrevPressedKey: prevActionBindng,
        onNextPressedKey: nextActionBindng,
        isPrevDisabled: page === 1,
        isNextDisabled: page === Math.ceil(allIds.length / PAGE_SIZE),
      }),
      createElement(IdConfigSelectMenu, {
        ids,
        config: pokemonConfig,
        placeholder: "Select a Pokemon to view",
        callbackBindingKey: onSpeciesSelectKey,
      }),
    ],
  };
};
