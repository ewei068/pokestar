const {
  backpackItemConfig,
  backpackCategories,
} = require("../../config/backpackConfig");
const {
  useCallbackBinding,
  useState,
  createElement,
} = require("../../deact/deact");
const { buildPokemonEmbed } = require("../../embeds/pokemonEmbeds");
const useTrainer = require("../../hooks/useTrainer");
const { getItemDisplay } = require("../../utils/itemUtils");
const { buildPokemonNameString } = require("../../utils/pokemonUtils");
const BackpackListWithSelection = require("../trainer/BackpackListWithSelection");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {CompactUser} param1.user
 * @param {WithId<Pokemon>} param1.pokemon
 */
const ChangeHeldItem = async (ref, { user, pokemon }) => {
  const { trainer, err } = await useTrainer(user, ref);
  if (err) {
    return {
      err,
    };
  }

  const [showItemSelect, setShowItemSelect] = useState(false, ref);
  const defaultContent = pokemon.heldItemId
    ? `**${buildPokemonNameString(pokemon)} is holding ${getItemDisplay(
        pokemon.heldItemId
      )}:**\n${backpackItemConfig[pokemon.heldItemId].description}`
    : `**${buildPokemonNameString(pokemon)} is not holding an item!**`;

  const changeItemButtonKey = useCallbackBinding(
    () => {
      setShowItemSelect(true);
    },
    ref,
    { defer: false }
  );

  if (showItemSelect) {
    return {
      elements: [
        createElement(BackpackListWithSelection, {
          backpackCategory: backpackCategories.HELD_ITEMS,
          backpack: trainer.backpack,
          shouldShowMoney: false,
          shouldShowDescription: true,
        }),
      ],
    };
  }
  return {
    contents: [defaultContent],
    embeds: [buildPokemonEmbed(user, pokemon, "info")],
  };
};

module.exports = ChangeHeldItem;
