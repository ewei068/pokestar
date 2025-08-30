const { buildPokemonEmbed } = require("../../embeds/pokemonEmbeds");
const {
  useAwaitedMemo,
  useCallbackBinding,
  createElement,
  useState,
} = require("../../deact/deact");
const useTrainer = require("../../hooks/useTrainer");
const { getArceus, onArceusFormSelect } = require("../../services/mythic");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { arceusMythicConfig } = require("../../config/mythicConfig");
const IdConfigSelectMenu = require("../foundation/IdConfigSelectMenu");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @returns {Promise<ComposedElements>}
 */
const Arceus = async (ref, { user }) => {
  const { trainer, err: trainerErr } = await useTrainer(user, ref);
  if (trainerErr) {
    return { err: trainerErr };
  }

  const { data: initialArceus, err: arceusErr } = await useAwaitedMemo(
    async () => getArceus(trainer),
    [],
    ref
  );
  if (arceusErr) {
    return { err: arceusErr };
  }
  const [arceus, setArceus] = useState(initialArceus, ref);

  const onFormSelectKey = useCallbackBinding(async (interaction) => {
    const speciesId = interaction.values[0];
    const { data: newArceus, err: newArceusErr } = await onArceusFormSelect(
      user,
      // @ts-ignore
      speciesId
    );
    if (newArceusErr) {
      return {
        err: newArceusErr,
      };
    }
    setArceus(newArceus);
  }, ref);

  // form change select menu
  const formSelectMenu = createElement(IdConfigSelectMenu, {
    ids: arceusMythicConfig.speciesIds,
    config: pokemonConfig,
    placeholder: "Select a form",
    callbackBindingKey: onFormSelectKey,
    showId: true,
  });

  return {
    contents: [arceus._id.toString()],
    embeds: [buildPokemonEmbed(user, arceus, "info")],
    components: [formSelectMenu],
  };
};

module.exports = Arceus;
