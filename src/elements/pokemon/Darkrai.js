const {
  buildPokemonEmbed,
  buildDarkraiAbilityEmbed,
} = require("../../embeds/pokemonEmbeds");
const { useAwaitedMemo } = require("../../deact/deact");
const useTrainer = require("../../hooks/useTrainer");
const { getDarkrai } = require("../../services/mythic");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @returns {Promise<ComposedElements>}
 */
const Darkrai = async (ref, { user }) => {
  const { trainer, err: trainerErr } = await useTrainer(user, ref);
  if (trainerErr) {
    return { err: trainerErr };
  }

  const { data: darkrai, err: darkraiErr } = await useAwaitedMemo(
    async () => getDarkrai(trainer),
    [],
    ref
  );
  if (darkraiErr) {
    return { err: darkraiErr };
  }

  return {
    contents: [darkrai._id.toString()],
    embeds: [
      buildPokemonEmbed(user, darkrai, "info"),
      buildDarkraiAbilityEmbed(trainer),
    ],
  };
};

module.exports = Darkrai;
