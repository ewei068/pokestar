/**
 * @file
 * @author Elvis Wei
 *
 * heldItem.js is used to allow the user to change a Pokemon's held item.
 */
const { createRoot } = require("../../deact/deact");
const ChangeHeldItem = require("../../elements/pokemon/ChangeHeldItem");
const FindPokemonFromOptionAndRender = require("../../elements/pokemon/FindPokemonFromOptionAndRender");
const { getUserFromInteraction } = require("../../utils/utils");

const heldItem = async (interaction, nameOrId) =>
  await createRoot(
    FindPokemonFromOptionAndRender,
    {
      user: getUserFromInteraction(interaction),
      option: nameOrId,
      element: ChangeHeldItem,
    },
    interaction,
    { ttl: 240 }
  );

const heldItemMessageCommand = async (message) => {
  const nameOrId = message.content.split(" ")[1];
  return await heldItem(message, nameOrId);
};

const heldItemSlashCommand = async (interaction) => {
  const nameOrId = interaction.options.getString("name_or_id");
  return await heldItem(interaction, nameOrId);
};

module.exports = {
  message: heldItemMessageCommand,
  slash: heldItemSlashCommand,
};
