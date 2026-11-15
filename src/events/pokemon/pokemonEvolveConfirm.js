/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * pokemonEvolveConfirm.js builds the after-confirmation menu for the relevant user's pokemon evolution.
 */
const { getState, deleteState } = require("../../services/state");
const { changePokemonSpecies } = require("../../services/pokemonTransform");
const { pokemonConfig } = require("../../config/pokemonConfig");
const { DEPRECATEDbuildPokemonEmbed } = require("../../embeds/pokemonEmbeds");

const pokemonEvolveConfirm = async (interaction, data) => {
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
  // if no pokemon selected, return
  if (!state.speciesId || data.targetSpeciesId !== state.speciesId) {
    return { err: "Choose an evolution again before confirming." };
  }

  const result = await changePokemonSpecies(interaction.user, state.pokemonId, {
    kind: "evolve", targetSpeciesId: data.targetSpeciesId, expectedVersion: state.version,
  });
  if (!result.data) return { err: result.err };
  const { trainer, pokemon, previousName, targetSpeciesId } = result.data;
  const newName = pokemonConfig[targetSpeciesId].name;
  const embed = DEPRECATEDbuildPokemonEmbed(trainer, pokemon);

  deleteState(data.stateId);

  await interaction.update({
    content: `Your ${previousName} evolved into a ${newName}!${result.warning ? `\n${result.warning}` : ""}`,
    embeds: [embed],
    components: [],
  });
};

module.exports = pokemonEvolveConfirm;
