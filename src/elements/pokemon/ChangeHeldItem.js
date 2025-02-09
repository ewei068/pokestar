const { backpackItemConfig } = require("../../config/backpackConfig");
const { buildPokemonEmbed } = require("../../embeds/pokemonEmbeds");
const { getItemDisplay } = require("../../utils/itemUtils");
const { buildPokemonNameString } = require("../../utils/pokemonUtils");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {CompactUser} param1.user
 * @param {WithId<Pokemon>} param1.pokemon
 */
const ChangeHeldItem = async (ref, { user, pokemon }) => {
  const defaultContent = pokemon.heldItemId
    ? `**${buildPokemonNameString(pokemon)} is holding ${getItemDisplay(
        pokemon.heldItemId
      )}:**\n${backpackItemConfig[pokemon.heldItemId].description}`
    : `**${buildPokemonNameString(pokemon)} is not holding an item!**`;
  return {
    contents: [defaultContent],
    embeds: [buildPokemonEmbed(user, pokemon, "info")],
  };
};

module.exports = ChangeHeldItem;
