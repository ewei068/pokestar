const { getPokemonOrder } = require("../../utils/pokemonUtils");
const { buildDexListEmbed } = require("../../embeds/pokemonEmbeds");
const { pokemonConfig } = require("../../config/pokemonConfig");
const {
  useState,
  useCallbackBinding,
  createElement,
} = require("../../deact/deact");
const ScrollButtons = require("../foundation/ScrollButtons");
const IdConfigSelectMenu = require("../foundation/IdConfigSelectMenu");
const PokedexPokemon = require("./PokedexPokemon");

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

  const allIds = getPokemonOrder();
  if (page < 1 || page > Math.ceil(allIds.length / 10)) {
    return { send: null, err: "Invalid page number." };
  }

  const start = (page - 1) * 10;
  const end = start + 10;
  const ids = allIds.slice(start, end);

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
  const speciesSelectCallbackBinding = useCallbackBinding(
    (interaction) => {
      const [id] = interaction.values;
      setSpeciesId(id);
      // TODO: set page with use effect
    },
    ref,
    callbackOptions
  );

  if (speciesId) {
    return {
      elements: [createElement(PokedexPokemon, { speciesId })],
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
        isNextDisabled: page === Math.ceil(allIds.length / 10),
      }),
      createElement(IdConfigSelectMenu, {
        ids,
        config: pokemonConfig,
        placeholder: "Select a Pokemon to view",
        callbackBindingKey: speciesSelectCallbackBinding,
      }),
    ],
  };
};
