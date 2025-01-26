const {
  buildPokemonEmbed,
  buildJirachiAbilityEmbed,
} = require("../../embeds/pokemonEmbeds");
const {
  useAwaitedMemo,
  useMemo,
  useCallbackBinding,
  createElement,
  useState,
  useCallback,
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

const starPieceEmoji = backpackItemConfig[backpackItems.STAR_PIECE].emoji;
const { mythicConfig } = pokemonConfig[pokemonIdEnum.JIRACHI];

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @param {Function} param1.setTrainer
 * @param {string} param1.wishId
 * @param {Function} param1.goBack
 * @returns {Promise<ComposedElements>}
 */
const ConfirmWish = async (ref, { user, setTrainer, wishId, goBack }) => {
  const [content, setContent] = useState("", ref);
  const [shouldShowResults, setShouldShowResults] = useState(false, ref);

  // confirm buttons
  const currentWishData = mythicConfig.wishes[wishId];
  const confirmContent =
    `Are you sure you want to make **Wish for ${currentWishData.name}** for ${currentWishData.starPieceCost}x ${starPieceEmoji} Star Pieces?` +
    `\n\n${currentWishData.description}`;
  const confirmButtonPressedKey = useCallbackBinding(async () => {
    const { result: useWishResult, err } = await useWish(user, {
      wishId,
    });
    if (err) {
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
    embeds: [],
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
  const { trainer, err: trainerErr, setTrainer } = await useTrainer(user, ref);
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

  // wish buttons
  const wishButtonPressedKey = useCallbackBinding(
    async (_interaction, data) => {
      const { wishId } = data;
      // TODO: for certain wish, confirm on target pokemon
      setSelectedWishId(wishId);
      setShouldShowConfirm(true);
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
          setTrainer,
          wishId: selectedWishId,
          goBack,
        }),
      ],
    };
  }
  return {
    contents: [content || jirachi._id.toString()],
    embeds: (content
      ? []
      : [buildPokemonEmbed(trainer, jirachi, "info")]
    ).concat([buildJirachiAbilityEmbed(trainer)]),
    components: [wishButtons],
  };
};

module.exports = Jirachi;
