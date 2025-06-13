const { createRoot } = require("../../deact/deact");
const PartyManage = require("../../elements/party/PartyManage");
const { getUserFromInteraction } = require("../../utils/utils");

/**
 * Creates an interactive party management UI
 * @param {any} interaction
 */
const partyManage = async (interaction) =>
  await createRoot(
    PartyManage,
    { user: getUserFromInteraction(interaction) },
    interaction,
    {
      defer: false,
      ttl: 180,
    }
  );

const partyManageMessageCommand = async (interaction) =>
  await partyManage(interaction);

const partyManageSlashCommand = async (interaction) => {
  await partyManage(interaction);
};

module.exports = {
  message: partyManageMessageCommand,
  slash: partyManageSlashCommand,
  execute: partyManageSlashCommand, // For backward compatibility
};
