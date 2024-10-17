const { getPokemonOrder } = require("../../utils/pokemonUtils");
const { buildDexListEmbed } = require("../../embeds/pokemonEmbeds");
const { useState } = require("../../deact/deact");

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

  return {
    element: {
      content: "",
      embeds: [buildDexListEmbed(ids, page)],
      components: [],
    },
  };
};
