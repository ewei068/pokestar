const {
  buildPokemonEmbed,
  buildJirachiAbilityEmbed,
} = require("../../embeds/pokemonEmbeds");
const {
  useAwaitedMemo,
  useMemo,
  useCallbackBinding,
  createElement,
} = require("../../deact/deact");
const useTrainer = require("../../hooks/useTrainer");
const { getJirachi, canTrainerUseWish } = require("../../services/mythic");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { pokemonIdEnum } = require("../../enums/pokemonEnums");
const Button = require("../../deact/elements/Button");
const {
  backpackItemConfig,
  backpackItems,
} = require("../../config/backpackConfig");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @returns {Promise<ComposedElements>}
 */
const Jirachi = async (ref, { user }) => {
  const mythicConifg = useMemo(
    () => pokemonConfig[pokemonIdEnum.JIRACHI].mythicConfig,
    [],
    ref
  );
  const { trainer, err: trainerErr } = await useTrainer(user, ref);
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
    (_interaction, data) => {
      const { wishId } = data;
      // TODO: handle wish
    },
    ref,
    { defer: false }
  );
  const wishButtons = Object.entries(mythicConifg.wishes).map(
    ([wishId, wish]) => {
      const canUseWish = canTrainerUseWish(trainer, { wishId });
      return createElement(Button, {
        label: `x${wish.starPieceCost} [${wish.name}]`,
        emoji: backpackItemConfig[backpackItems.STAR_PIECE].emoji,
        disabled: !!canUseWish.err,
        callbackBindingKey: wishButtonPressedKey,
        data: { wishId },
      });
    }
  );

  return {
    contents: [jirachi._id.toString()],
    embeds: [
      buildPokemonEmbed(trainer, jirachi, "info"),
      buildJirachiAbilityEmbed(trainer),
    ],
    components: [wishButtons],
  };
};

module.exports = Jirachi;
