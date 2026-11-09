/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * natureConfirm.js Builds the confirmation menu for the nature selected for the pokemon.
 */
const { getState } = require("../services/state");
const { changePokemonNature } = require("../services/pokemonNature");
const { natureConfig } = require("../config/pokemonConfig");
const {
  backpackItemConfig,
  backpackItems,
} = require("../config/backpackConfig");

const natureConfirm = async (interaction, data) => {
  // get state
  const state = getState(data.stateId);
  if (!state) {
    await interaction.update({
      components: [],
    });
    return { err: "This interaction has expired." };
  }

  // if data has userId component, verify interaction was done by that user
  if (state.userId && interaction.user.id !== state.userId) {
    return { err: "This interaction was not initiated by you." };
  }

  // get which option was selected
  const { natureId } = state;
  const natureData = natureConfig[natureId];
  if (!natureData) {
    return { err: "Invalid nature selection." };
  }

  const result = await changePokemonNature(
    interaction.user, state.pokemonId, natureId, state.expectedNatureId
  );
  if (result.err || !result.data) return { err: result.err || "Could not confirm the nature change. Refresh before trying again." };
  if (!result.data.changed) return { err: "This pokemon already has this nature." };
  const { pokemon } = result.data;

  await interaction.update({
    content: `Changed ${pokemon.name}'s nature to ${natureData.name} for 1 ${
      backpackItemConfig[backpackItems.MINT].emoji
    }!`,
    components: [],
  });
};

module.exports = natureConfirm;
