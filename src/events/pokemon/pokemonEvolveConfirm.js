/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * pokemonEvolveConfirm.js builds the after-confirmation menu for the relevant user's pokemon evolution.
 */
const { getState, deleteState } = require("../../services/state");
const { getTrainer } = require("../../services/trainer");
const { getPokemon, evolvePokemon } = require("../../services/pokemon");
const { buildPokemonEmbed } = require("../../embeds/pokemonEmbeds");

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
  if (!state.speciesId) {
    return { err: "No pokemon selected." };
  }

  // get trainer
  const trainer = await getTrainer(interaction.user);
  if (trainer.err) {
    return { err: trainer.err };
  }

  // get pokemon
  const pokemon = await getPokemon(trainer.data, state.pokemonId);
  if (pokemon.err) {
    return { err: pokemon.err };
  }
  const originalName = pokemon.data.name;

  // evolve pokemon
  const { speciesId } = state;
  const evolveResult = await evolvePokemon(pokemon.data, speciesId);
  if (evolveResult.err) {
    return { err: evolveResult.err };
  }
  const { pokemon: evolvedPokemon, species: newName } = evolveResult.data;

  // update embed to selected evolution
  const embed = buildPokemonEmbed(trainer.data, evolvedPokemon);

  deleteState(data.stateId);

  await interaction.update({
    content: `Your ${originalName} evolved into a ${newName}!`,
    embeds: [embed],
    components: [],
  });
};

module.exports = pokemonEvolveConfirm;
