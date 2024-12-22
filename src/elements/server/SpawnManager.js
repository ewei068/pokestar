const { ButtonStyle } = require("discord.js");
const {
  useState,
  useAwaitedMemo,
  useCallbackBinding,
  createElement,
  createModal,
  useModalSubmitCallbackBinding,
} = require("../../deact/deact");
const { buildPokemonSearchModal } = require("../../modals/pokemonModals");
const Button = require("../../deact/elements/Button");
const { getGuildData } = require("../../services/guild");
const { buildSpawnManagerEmbed } = require("../../embeds/serverEmbeds");

/**
 * @type {DeactElementFunction<{
 *  guild: DiscordGuild,
 *  initialChannelToAdd?: string,
 *  initialChannelToRemove?: string,
 * }>}
 */
module.exports = async (
  ref,
  { guild, initialChannelToAdd, initialChannelToRemove }
) => {
  const [errorString, setErrorString] = useState(undefined, ref);

  const guildRes = await useAwaitedMemo(
    () => getGuildData(guild.id),
    [guild.id],
    ref
  );
  if (guildRes.err) {
    return { err: guildRes.err };
  }
  const guildData = guildRes.data;

  const searchSubmittedActionBinding = useModalSubmitCallbackBinding(
    (interaction) => {
      const pokemonSearchInput =
        interaction.fields.getTextInputValue("pokemonSearchInput");
      setFilter({
        ...filter,
        name: pokemonSearchInput,
      });
      setPage(1);
    },
    ref
  );
  const openSearchModalBinding = useCallbackBinding(
    (interaction) => {
      const currentName = filter.name;
      return createModal(
        buildPokemonSearchModal,
        {
          value: currentName,
          required: false,
        },
        searchSubmittedActionBinding,
        interaction,
        ref
      );
    },
    ref,
    { defer: false }
  );

  return {
    elements: [
      {
        content:
          errorString ||
          "Manage spawning in your server by changing the spawn mode and adding or removing channels.",
        embeds: [buildSpawnManagerEmbed(guildData)],
      },
    ],
    components: [],
  };
};
