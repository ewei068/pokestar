const { buildPokemonEmbed } = require("../../embeds/pokemonEmbeds");
const { useAwaitedMemo } = require("../../deact/deact");
const useTrainer = require("../../hooks/useTrainer");
const { getJirachi } = require("../../services/mythic");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {DiscordUser} param1.user
 * @returns {Promise<ComposedElements>}
 */
const Jirachi = async (ref, { user }) => {
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

  return {
    contents: [jirachi._id.toString()],
    embeds: [buildPokemonEmbed(trainer, jirachi, "info")],
  };
};

module.exports = Jirachi;
