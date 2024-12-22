const { createRoot, userTypeEnum } = require("../../deact/deact");
const SpawnManager = require("../../elements/server/SpawnManager");

const spawnManage = async (interaction, guild) =>
  await createRoot(
    SpawnManager,
    {
      guild,
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

const spawnManageMessageCommand = async (message, client) =>
  await spawnManage(message, client.guilds.cache.get(message.guildId));

const spawnManageSlashCommand = async (interaction, client) =>
  await spawnManage(interaction, client.guilds.cache.get(interaction.guildId));

module.exports = {
  message: spawnManageMessageCommand,
  slash: spawnManageSlashCommand,
};
