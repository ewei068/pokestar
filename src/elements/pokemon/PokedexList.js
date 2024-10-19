const { getPokemonOrder } = require("../../utils/pokemonUtils");
const { buildDexListEmbed } = require("../../embeds/pokemonEmbeds");
const {
  useState,
  useCallbackBinding,
  createElement,
} = require("../../deact/deact");
const ScrollButtons = require("../foundation/ScrollButtons");

/**
 *
 * @param {import("../../deact/DeactElement").DeactElement} ref
 * @param {*} param1
 * @returns
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

  const prevActionBindng = useCallbackBinding(() => {
    setPage(page - 1);
  }, ref);
  const nextActionBindng = useCallbackBinding(() => {
    setPage(page + 1);
  }, ref);

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
    ],
  };
};
