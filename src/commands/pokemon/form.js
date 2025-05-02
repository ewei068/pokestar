/**
 * @file
 *
 * form.js is used to allow the user to change a Pokemon's form.
 */
const { createRoot } = require("../../deact/deact");
const ChangeForm = require("../../elements/pokemon/ChangeForm");
const FindPokemonFromOptionAndRender = require("../../elements/pokemon/FindPokemonFromOptionAndRender");
const { getUserFromInteraction } = require("../../utils/utils");

const form = async (interaction, nameOrId) =>
  await createRoot(
    FindPokemonFromOptionAndRender,
    {
      user: getUserFromInteraction(interaction),
      option: nameOrId,
      element: ChangeForm,
    },
    interaction,
    { ttl: 240, defer: false }
  );

const formMessageCommand = async (message) => {
  const nameOrId = message.content.split(" ")[1];
  return await form(message, nameOrId);
};

const formSlashCommand = async (interaction) => {
  const nameOrId = interaction.options.getString("name_or_id");
  return await form(interaction, nameOrId);
};

module.exports = {
  message: formMessageCommand,
  slash: formSlashCommand,
};
