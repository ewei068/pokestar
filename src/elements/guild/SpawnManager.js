const { ButtonStyle } = require("discord.js");
const {
  useState,
  useCallbackBinding,
  createElement,
  createModal,
  useModalSubmitCallbackBinding,
  useAwaitedEffect,
  useCallback,
} = require("../../deact/deact");
const Button = require("../../deact/elements/Button");
const {
  getGuildData,
  addSpawnChannel,
  removeSpawnChannel,
  switchChannelSpawnMode,
} = require("../../services/guild");
const { buildSpawnManagerEmbed } = require("../../embeds/guildEmbeds");
const { buildGenericTextInputModal } = require("../../modals/genericModals");
const usePagination = require("../../hooks/usePagination");

const TEXT_INPUT_ID = "channelSubmitInput";

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
  const [guildData, setGuildData] = useState(undefined, ref);

  await useAwaitedEffect(
    async () => {
      await getGuildData(guild.id).then((res) => {
        if (res.err) {
          setErrorString(res.err);
        } else {
          setGuildData(res.data);
        }
      });
    },
    [guild.id],
    ref
  );

  const addChannelToList = useCallback(
    async (channelId) => {
      await addSpawnChannel(guild, channelId).then((res) => {
        if (res.err) {
          setErrorString(res.err);
        } else {
          setGuildData(res.data);
          setErrorString(undefined);
        }
      });
    },
    [guild],
    ref
  );
  const removeChannelFromList = useCallback(
    async (channelId) => {
      await removeSpawnChannel(guild, channelId).then((res) => {
        if (res.err) {
          setErrorString(res.err);
        } else {
          setGuildData(res.data);
          setErrorString(undefined);
        }
      });
    },
    [guild],
    ref
  );

  await useAwaitedEffect(
    async () => {
      if (initialChannelToAdd) {
        await addChannelToList(initialChannelToAdd);
      }
      if (initialChannelToRemove) {
        await removeChannelFromList(initialChannelToRemove);
      }
    },
    [],
    ref
  );

  const modalSubmittedCallbackBinding = useModalSubmitCallbackBinding(
    async (interaction, data) => {
      const channelInput = interaction.fields.getTextInputValue(TEXT_INPUT_ID);
      const { action } = data;
      if (action === "add") {
        await addChannelToList(channelInput);
      } else if (action === "remove") {
        await removeChannelFromList(channelInput);
      } else {
        setErrorString("Invalid channel action! Report this bug to me lol.");
      }
    },
    ref,
    { defer: false }
  );
  const openChannelActionModal = (interaction, action) =>
    createModal(
      buildGenericTextInputModal,
      {
        textInputId: TEXT_INPUT_ID,
        title:
          action === "add"
            ? "Add Channel ID From List"
            : "Remove Channel ID From List",
        label: "Channel ID (see error instructions if failed)",
        placeholder: "Channel ID",
        required: true,
      },
      modalSubmittedCallbackBinding,
      interaction,
      ref,
      {
        action,
      }
    );
  const addChannelCallbackBinding = useCallbackBinding(
    (interaction) => openChannelActionModal(interaction, "add"),
    ref,
    { defer: false }
  );
  const removeChannelCallbackBinding = useCallbackBinding(
    (interaction) => openChannelActionModal(interaction, "remove"),
    ref,
    { defer: false }
  );

  const switchChannelSpawnModeBinding = useCallbackBinding(
    async () => {
      await switchChannelSpawnMode(guild).then((res) => {
        if (res.err) {
          setErrorString(res.err);
        } else {
          setGuildData(res.data);
          setErrorString(undefined);
        }
      });
    },
    ref,
    { defer: false }
  );

  const {
    items: channelIds,
    page,
    scrollButtonsElement,
  } = usePagination(
    {
      allItems: guildData?.spawnSettings?.channelIds ?? [],
      pageSize: 20,
      initialPage: 1,
    },
    ref
  );

  return {
    elements: [
      {
        content: errorString
          ? `**ERROR:** ${errorString}`
          : "Manage spawning in your server by changing the spawn mode and adding or removing channels.",
        embeds: guildData
          ? [buildSpawnManagerEmbed(guildData, channelIds, page)]
          : [],
      },
    ],
    components: guildData
      ? [
          scrollButtonsElement,
          [
            createElement(Button, {
              label: "Add Channel ID",
              emoji: "➕",
              style: ButtonStyle.Success,
              callbackBindingKey: addChannelCallbackBinding,
            }),
            createElement(Button, {
              label: "Remove Channel ID",
              emoji: "➖",
              style: ButtonStyle.Danger,
              callbackBindingKey: removeChannelCallbackBinding,
            }),
            createElement(Button, {
              label: "Switch Channel Spawn Mode",
              emoji: "🔄",
              style: ButtonStyle.Secondary,
              callbackBindingKey: switchChannelSpawnModeBinding,
            }),
          ],
        ]
      : [],
  };
};
