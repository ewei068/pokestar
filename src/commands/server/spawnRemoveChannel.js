const { createRoot, userTypeEnum } = require("../../deact/deact");
const SpawnManager = require("../../elements/guild/SpawnManager");
const { getChannelId } = require("../../utils/utils");

const spawnRemoveChannel = async (interaction, guild, channelId) =>
  await createRoot(
    SpawnManager,
    {
      guild,
      initialChannelToRemove: channelId,
    },
    interaction,
    {
      defer: false,
      ttl: 180,
      userIdForFilter: userTypeEnum.ANY,
      customFilter: async (incomingInteraction) => {
        // @ts-ignore
        const { member } = incomingInteraction;
        // check if user can manage roles
        if (!member.permissions.has("ManageRoles")) {
          return {
            err: "You do not have permission to toggle spawn. You must have the MANAGE ROLES permission to do so.",
          };
        }
        return {};
      },
    }
  );

const spawnRemoveChannelMessageCommand = async (message, client) => {
  const args = message.content.split(" ");
  const channelId = getChannelId(args[1]);
  await spawnRemoveChannel(
    message,
    client.guilds.cache.get(message.guildId),
    channelId
  );
};

const spawnRemoveChannelSlashCommand = async (interaction, client) =>
  await spawnRemoveChannel(
    interaction,
    client.guilds.cache.get(interaction.guildId),
    interaction.options.getChannel("channel")?.id
  );

module.exports = {
  message: spawnRemoveChannelMessageCommand,
  slash: spawnRemoveChannelSlashCommand,
};
