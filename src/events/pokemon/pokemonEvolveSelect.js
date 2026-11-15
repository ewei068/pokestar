/* eslint-disable no-param-reassign */
/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * pokemonEvolveSelect.js Builds the confirmation menu from the selection of the user in their pokemon's evolution.
 */
const { getPokemon, transformPokemon } = require("../../services/pokemon");
const { getTransformChoices, getTransformVersion } = require("../../services/pokemonTransform");
const { getState } = require("../../services/state");
const { getTrainer } = require("../../services/trainer");
const { DEPRECATEDbuildPokemonEmbed } = require("../../embeds/pokemonEmbeds");
const { buildButtonActionRow } = require("../../components/buttonActionRow");
const { eventNames } = require("../../config/eventConfig");

const pokemonEvolveSelect = async (interaction, data) => {
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

  // update embed to selected evolution
  const speciesId = interaction.values[0];
  const choice = getTransformChoices(pokemon.data.speciesId).find(option => option.kind === "evolve"
    && option.targetSpeciesId === speciesId && pokemon.data.level >= option.requiredLevel);
  if (!choice || getTransformVersion(pokemon.data) !== state.version) {
    return { err: "This Pokémon changed. Use /evolve to check its current evolutions." };
  }
  state.speciesId = choice.targetSpeciesId;
  const evolvedPokemon = transformPokemon({ ...pokemon.data }, choice.targetSpeciesId);
  const embed = DEPRECATEDbuildPokemonEmbed(trainer.data, evolvedPokemon);

  // get confirm button
  const rowData = {
    stateId: data.stateId,
    targetSpeciesId: choice.targetSpeciesId,
  };
  const confirmButtonRow = buildButtonActionRow(
    [
      {
        label: "Evolve!",
        disabled: false,
        data: rowData,
      },
    ],
    eventNames.POKEMON_EVOLVE_CONFIRM
  );

  // if message components length > 1, replace with last component, else append
  if (interaction.message.components.length > 1) {
    interaction.message.components[1] = confirmButtonRow;
  } else {
    interaction.message.components.push(confirmButtonRow);
  }

  await interaction.update({
    content: interaction.message.content,
    embeds: [embed],
    components: interaction.message.components,
  });
};

module.exports = pokemonEvolveSelect;
