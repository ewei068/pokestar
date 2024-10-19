const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getPokemonOrder } = require("../../utils/pokemonUtils");
const { buildDexListEmbed } = require("../../embeds/pokemonEmbeds");
const {
  useState,
  useCallbackBinding,
  makeComponentId,
  createElement,
} = require("../../deact/deact");
const Button = require("../../deact/foundation/Button");

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

  const pageActionBindng = useCallbackBinding((interaction, data) => {
    setPage(data.page);
  }, ref);

  return {
    elements: [
      {
        content: "",
        embeds: [buildDexListEmbed(ids, page)],
      },
    ],
    components: [
      [
        createElement(Button, {
          label: "◄",
          style: ButtonStyle.Secondary,
          bindingKey: pageActionBindng,
          disabled: page === 1,
          data: { page: page - 1 },
        }),
        createElement(Button, {
          label: "►",
          style: ButtonStyle.Secondary,
          bindingKey: pageActionBindng,
          disabled: page >= Math.ceil(allIds.length / 10),
          data: { page: page + 1 },
        }),
      ],
    ],
  };
};
