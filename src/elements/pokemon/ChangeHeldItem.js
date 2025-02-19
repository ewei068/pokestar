const { ButtonStyle } = require("discord.js");
const {
  backpackItemConfig,
  backpackCategories,
} = require("../../config/backpackConfig");
const {
  useCallbackBinding,
  useState,
  createElement,
  useCallback,
} = require("../../deact/deact");
const Button = require("../../deact/elements/Button");
const { buildPokemonEmbed } = require("../../embeds/pokemonEmbeds");
const useTrainer = require("../../hooks/useTrainer");
const { getItemDisplay } = require("../../utils/itemUtils");
const { buildPokemonNameString } = require("../../utils/pokemonUtils");
const BackpackListWithSelection = require("../trainer/BackpackListWithSelection");
const ReturnButton = require("../foundation/ReturnButton");
const { changeHeldItem, removeHeldItem } = require("../../services/pokemon");
const usePokemon = require("../../hooks/usePokemon");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {CompactUser} param1.user
 * @param {string} param1.pokemonId
 */
const ChangeHeldItem = async (ref, { user, pokemonId }) => {
  const {
    trainer,
    err: trainerErr,
    setTrainer,
    refreshTrainer,
  } = await useTrainer(user, ref);
  if (trainerErr) {
    return {
      err: trainerErr,
    };
  }
  const {
    pokemon,
    err: pokemonErr,
    setPokemon,
    refreshPokemon,
  } = await usePokemon(pokemonId, user.id, ref);
  if (pokemonErr) {
    return {
      err: pokemonErr,
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
  const [content, setContent] = useState(null, ref);

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

  const onItemSelected = useCallback(
    async (selectedItem) => {
      const {
        data: { pokemon: newPokemon, trainer: newTrainer },
        err: changeItemErr,
      } = await changeHeldItem(user, pokemon._id.toString(), selectedItem);
      if (changeItemErr) {
        refreshTrainer();
        refreshPokemon();
        setContent(changeItemErr);
      } else {
        setTrainer(newTrainer);
        setPokemon(newPokemon);
        setContent(
          `**${buildPokemonNameString(
            newPokemon
          )} is now holding ${getItemDisplay(selectedItem)}!**`
        );
      }
      setShowItemSelect(false);
    },
    [
      setShowItemSelect,
      setContent,
      setPokemon,
      user,
      pokemon,
      setTrainer,
      refreshTrainer,
    ],
    ref
  );
  const removeItemButtonKey = useCallbackBinding(async () => {
    const {
      data: { pokemon: newPokemon, trainer: newTrainer },
      err: changeItemErr,
    } = await removeHeldItem(user, pokemon._id.toString());
    if (changeItemErr) {
      refreshTrainer();
      refreshPokemon();
      setContent(changeItemErr);
    } else {
      setTrainer(newTrainer);
      setPokemon(newPokemon);
      setContent(
        `**${buildPokemonNameString(
          newPokemon
        )} is no longer holding an item!**`
      );
    }
  }, ref);

  if (showItemSelect) {
    return {
      elements: [
        createElement(BackpackListWithSelection, {
          backpackCategory: backpackCategories.HELD_ITEMS,
          backpack: trainer.backpack,
          shouldShowMoney: false,
          shouldShowDescription: true,
          onItemSelected,
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
    contents: [content || defaultContent],
    embeds: [buildPokemonEmbed(user, pokemon, "info")],
    components: [
      [
        createElement(Button, {
          label: currentHeldItem ? "Change Held Item" : "Give Held Item",
          style: ButtonStyle.Primary,
          callbackBindingKey: changeItemButtonKey,
          emoji: currentHeldItem ? heldItemData.emoji : undefined,
        }),
        createElement(Button, {
          label: "Remove Held Item",
          style: ButtonStyle.Danger,
          callbackBindingKey: removeItemButtonKey,
          disabled: !currentHeldItem,
          emoji: "✖️",
        }),
      ],
    ],
  };
};

module.exports = ChangeHeldItem;
