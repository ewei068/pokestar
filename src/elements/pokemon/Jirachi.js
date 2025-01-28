const {
  buildJirachiAbilityEmbed,
  buildPokemonEmbed,
} = require("../../embeds/pokemonEmbeds");
const {
  useAwaitedMemo,
  useCallbackBinding,
  createElement,
  useState,
  useCallback,
  createModal,
  useModalSubmitCallbackBinding,
} = require("../../deact/deact");
const useTrainer = require("../../hooks/useTrainer");
const {
  getJirachi,
  canTrainerUseWish,
  useWish,
} = require("../../services/mythic");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { pokemonIdEnum } = require("../../enums/pokemonEnums");
const Button = require("../../deact/elements/Button");
const {
  backpackItemConfig,
  backpackItems,
} = require("../../config/backpackConfig");
const YesNoButtons = require("../foundation/YesNoButtons");
const { buildPokemonIdSearchModal } = require("../../modals/pokemonModals");
const { getPokemon } = require("../../services/pokemon");
const { formatItemQuantity } = require("../../utils/itemUtils");

const starPieceEmoji = backpackItemConfig[backpackItems.STAR_PIECE].emoji;
const { mythicConfig } = pokemonConfig[pokemonIdEnum.JIRACHI];

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @param {() => Promise<any>} param1.refreshTrainer
 * @param {string} param1.wishId
 * @param {Function} param1.goBack
 * @param {WithId<Pokemon>?=} param1.selectedPokemon
 * @returns {Promise<ComposedElements>}
 */
const ConfirmWish = async (
  ref,
  { user, refreshTrainer, wishId, goBack, selectedPokemon }
) => {
  const [content, setContent] = useState("", ref);
  const [shouldShowResults, setShouldShowResults] = useState(false, ref);

  // confirm buttons
  const currentWishData = mythicConfig.wishes[wishId];
  const selectedPokemonString = selectedPokemon
    ? `on **${selectedPokemon.name}** `
    : "";
  const confirmContent = `Are you sure you want to make **Wish for ${
    currentWishData.name
  }** ${selectedPokemonString}for ${formatItemQuantity(
    backpackItems.STAR_PIECE,
    currentWishData.starPieceCost
  )}?\n\n${currentWishData.description}`;
  const confirmButtonPressedKey = useCallbackBinding(async () => {
    const { result: useWishResult, err } = await useWish(user, {
      wishId,
    });
    if (err) {
      await refreshTrainer();
      goBack(err);
      return;
    }

    setShouldShowResults(true);
    setContent(useWishResult);
  }, ref);
  const denyButtonPressedKey = useCallbackBinding(() => {
    goBack();
  }, ref);

  return {
    contents: [content || confirmContent],
    embeds: selectedPokemon
      ? [buildPokemonEmbed(user, selectedPokemon, "info")]
      : [],
    components: shouldShowResults
      ? []
      : [
          [
            createElement(YesNoButtons, {
              onYesPressedKey: confirmButtonPressedKey,
              onNoPressedKey: denyButtonPressedKey,
            }),
          ],
        ],
  };
};

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @returns {Promise<ComposedElements>}
 */
const Jirachi = async (ref, { user }) => {
  const [content, setContent] = useState("", ref);
  const [shouldShowConfirm, setShouldShowConfirm] = useState(false, ref);
  const [selectedWishId, setSelectedWishId] = useState("", ref);
  const [selectedPokemon, setSelectedPokemon] = useState(null, ref);
  const {
    trainer,
    err: trainerErr,
    refreshTrainer,
  } = await useTrainer(user, ref);
  if (trainerErr) {
    return { err: trainerErr };
  }

  const { data: jirachi, err: jirachiErr } = await useAwaitedMemo(
    async () => getJirachi(trainer),
    [],
    ref
  );
  if (jirachiErr) {
    return { err: jirachiErr };
  }

  // pokemon ID input
  const idSubmittedActionBinding = useModalSubmitCallbackBinding(
    async (interaction) => {
      const pokemonIdInput =
        interaction.fields.getTextInputValue("pokemonIdInput");
      const { data: pokemon, err } = await getPokemon(trainer, pokemonIdInput);
      if (err) {
        setContent("Pokemon not found. Make sure you enter its full exact ID!");
        setSelectedWishId("");
        return;
      }

      setSelectedPokemon(pokemon);
      setShouldShowConfirm(true);
    },
    ref
  );

  // wish buttons
  const wishButtonPressedKey = useCallbackBinding(
    async (interaction, data) => {
      const { wishId } = data;
      if (wishId === "power" || wishId === "rebirth") {
        await createModal(
          buildPokemonIdSearchModal,
          {},
          idSubmittedActionBinding,
          interaction,
          ref
        );
      } else {
        setShouldShowConfirm(true);
      }
      setSelectedWishId(wishId);
    },
    ref,
    { defer: false }
  );
  const wishButtons = Object.entries(mythicConfig.wishes).map(
    ([wishId, wish]) => {
      const canUseWish = canTrainerUseWish(trainer, { wishId });
      return createElement(Button, {
        label: `x${wish.starPieceCost} [${wish.name}]`,
        emoji: starPieceEmoji,
        disabled: !!canUseWish.err,
        callbackBindingKey: wishButtonPressedKey,
        data: { wishId },
      });
    }
  );
  const goBack = useCallback(
    (err = "") => {
      setSelectedPokemon(null);
      setShouldShowConfirm(false);
      setSelectedWishId("");
      setContent(err);
    },
    [setShouldShowConfirm, setSelectedWishId, setContent],
    ref
  );

  if (shouldShowConfirm) {
    return {
      elements: [
        createElement(ConfirmWish, {
          user,
          refreshTrainer,
          wishId: selectedWishId,
          goBack,
          selectedPokemon,
        }),
      ],
    };
  }
  return {
    contents: [content || jirachi._id.toString()],
    embeds: (content ? [] : [buildPokemonEmbed(user, jirachi, "info")]).concat([
      buildJirachiAbilityEmbed(trainer),
    ]),
    components: [wishButtons],
  };
};

module.exports = Jirachi;
