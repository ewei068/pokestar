/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * PokemonReleasePage.js displays the current page of pokemon that the user selected to release from their list of pokemon.
 */
const { buildReleaseSend } = require("../../services/pokemon");
const { getState } = require("../../services/state");

const pokemonReleasePage = async (interaction, data) => {
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

  const { send, err } = await buildReleaseSend(
    interaction.user,
    state.pokemonIds
  );
  if (err) {
    return { err };
  }
  await interaction.update(send);
};

module.exports = pokemonReleasePage;
