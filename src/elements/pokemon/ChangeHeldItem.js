const { ButtonStyle } = require("discord.js");
const {
  backpackItemConfig,
  backpackCategories,
} = require("../../config/backpackConfig");
const {
  useCallbackBinding,
  useState,
  createElement,
} = require("../../deact/deact");
const Button = require("../../deact/elements/Button");
const { buildPokemonEmbed } = require("../../embeds/pokemonEmbeds");
const useTrainer = require("../../hooks/useTrainer");
const { getItemDisplay } = require("../../utils/itemUtils");
const { buildPokemonNameString } = require("../../utils/pokemonUtils");
const BackpackListWithSelection = require("../trainer/BackpackListWithSelection");
const ReturnButton = require("../foundation/ReturnButton");

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
  const currentHeldItem = pokemon.heldItemId;
  const heldItemData = currentHeldItem
    ? backpackItemConfig[currentHeldItem]
    : {};
  const defaultContent = currentHeldItem
    ? `**${buildPokemonNameString(pokemon)} is holding ${getItemDisplay(
        currentHeldItem
      )}:**\n${heldItemData.description}`
    : `**${buildPokemonNameString(pokemon)} is not holding an item!**`;

  const changeItemButtonKey = useCallbackBinding(
    () => {
      setShowItemSelect(true);
    },
    ref,
    { defer: false }
  );
  const returnButtonKey = useCallbackBinding(
    () => {
      setShowItemSelect(false);
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
      components: [
        createElement(ReturnButton, {
          callbackBindingKey: returnButtonKey,
        }),
      ],
    };
  }
  return {
    contents: [defaultContent],
    embeds: [buildPokemonEmbed(user, pokemon, "info")],
    components: [
      createElement(Button, {
        label: currentHeldItem ? "Change Held Item" : "Give Held Item",
        style: ButtonStyle.Primary,
        callbackBindingKey: changeItemButtonKey,
        emoji: currentHeldItem ? heldItemData.emoji : undefined,
      }),
    ],
  };
};

module.exports = ChangeHeldItem;
