/**
 * @file
 * @author Elvis Wei
 *
 * PokemonScroll.js Creates the current page for the pokemon that can be released as a scrollmenu.
 */
const { getTrainer } = require("../../services/trainer");
const {
  listPokemonsFromTrainer: listPokemons,
} = require("../../services/pokemon");
const { buildPokemonListEmbed } = require("../../embeds/pokemonEmbeds");
const { buildScrollActionRow } = require("../../components/scrollActionRow");
const { buildPokemonSelectRow } = require("../../components/pokemonSelectRow");
const { eventNames } = require("../../config/eventConfig");
const { getState } = require("../../services/state");
const { buildButtonActionRow } = require("../../components/buttonActionRow");

const pokemonScroll = async (interaction, data) => {
  // get state
  const state = getState(data.stateId);
  if (!state) {
    await interaction.update({
      components: [],
    });
    return { err: "This interaction has expired." };
  }

  // verify user is the same as the user who pressed the button
  if (state.userId && interaction.user.id !== state.userId) {
    return { err: "This interaction was not initiated by you." };
  }

  const { listOptions } = state;

  const { page } = data;
  if (!page || page < 1) {
    return { err: "Invalid page." };
  }
  listOptions.page = page;

  // TODO: move to one function?
  const trainer = await getTrainer(interaction.user);
  if (trainer.err) {
    return { err: trainer.err };
  }

  const pokemons = await listPokemons(trainer.data, listOptions);
  if (pokemons.err) {
    return { err: pokemons.err };
  }
  state.pokemonIds = pokemons.data.map((pokemon) => pokemon._id.toString());

  const embed = buildPokemonListEmbed(
    trainer.data.user.username,
    pokemons.data,
    page
  );
  const scrollRowData = {
    stateId: data.stateId,
  };
  const scrollActionRow = buildScrollActionRow(
    page,
    pokemons.lastPage,
    scrollRowData,
    eventNames.POKEMON_SCROLL
  );

  const selectRowData = {
    stateId: data.stateId,
  };
  const pokemonSelectRow = buildPokemonSelectRow(
    pokemons.data,
    selectRowData,
    eventNames.POKEMON_LIST_SELECT
  );

  // build releast page
  const releasePageData = {
    stateId: data.stateId,
  };
  const releasePageRow = buildButtonActionRow(
    [
      {
        label: "Release Page",
        disabled: false,
        data: releasePageData,
      },
    ],
    eventNames.POKEMON_RELEASE_PAGE,
    true
  );

  await interaction.update({
    content: interaction.message.content,
    embeds: [embed],
    components: [scrollActionRow, pokemonSelectRow, releasePageRow],
  });
};

module.exports = pokemonScroll;
