const { buildPokemonEmbed } = require("../../embeds/pokemonEmbeds");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {CompactUser} param1.user
 * @param {WithId<Pokemon>} param1.pokemon
 */
const ChangeHeldItem = async (ref, { user, pokemon }) => ({
  embeds: [buildPokemonEmbed(user, pokemon, "info")],
});

module.exports = ChangeHeldItem;
