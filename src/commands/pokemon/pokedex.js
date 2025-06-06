/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * pokedex.js shows the pokedex entry of the pokemon id.
 */
const { createRoot, userTypeEnum } = require("../../deact/deact");
const PokedexList = require("../../elements/pokemon/PokedexList");

/**
 * Shows the pokedex entry of the pokemon id.
 * @param interaction
 * @param {*} id the id of the pokemon
 * @returns
 */
const pokedex = async (interaction, id) =>
  await createRoot(PokedexList, { initialSpeciesIdOrName: id }, interaction, {
    userIdForFilter: userTypeEnum.ANY,
  });

const pokedexMessageCommand = async (interaction) => {
  const args = interaction.content.split(" ");
  args.shift();
  const id = args[0];
  return await pokedex(interaction, id);
};

const pokedexSlashCommand = async (interaction) => {
  const id = interaction.options.getString("species");
  return await pokedex(interaction, id);
};

module.exports = {
  message: pokedexMessageCommand,
  slash: pokedexSlashCommand,
};
