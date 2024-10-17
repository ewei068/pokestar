const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getPokemonOrder } = require("../../utils/pokemonUtils");
const { buildDexListEmbed } = require("../../embeds/pokemonEmbeds");
const { useState, useCallbackBinding } = require("../../deact/deact");

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

  // TODO: componentify
  const actionRow = new ActionRowBuilder();
  const leftButtonId = {
    page: page - 1,
    key: pageActionBindng,
    isDeact: true,
    stateId: ref.rootInstance.stateId,
  };
  const leftButton = new ButtonBuilder()
    .setCustomId(`${JSON.stringify(leftButtonId)}`)
    .setLabel("◄")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page <= 1);
  const rightButtonId = {
    page: page + 1,
    key: pageActionBindng,
    isDeact: true,
    stateId: ref.rootInstance.stateId,
  };
  const rightButton = new ButtonBuilder()
    .setCustomId(`${JSON.stringify(rightButtonId)}`)
    .setLabel("►")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page >= Math.ceil(allIds.length / 10));
  actionRow.addComponents(leftButton, rightButton);

  return {
    element: {
      content: "",
      embeds: [buildDexListEmbed(ids, page)],
      components: [actionRow],
    },
  };
};
