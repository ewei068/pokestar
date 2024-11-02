/* eslint-disable no-param-reassign */
/**
 * @file
 * @author Elvis Wei
 *
 * list.js fetches a list of a trainer's pokemon, returning an embed with the list.
 */

const { getUserFromInteraction } = require("../../utils/utils");
const { createRoot } = require("../../deact/deact");
const PokemonList = require("../../elements/pokemon/PokemonList");

/**
 * Fetches a list of a trainer's Pokemon, returning an embed with the list.
 * Uses pagination, filtering, and sorting. Also allows users to select a Pokemon
 * to copy its ID.
 * @param {object} interaction interaction that initiated the command.
 * @param {number} page Page of the list to display.
 * @param {string} filterBy Field to filter by.
 * @param {string | boolean} filterValue Value to filter for equality.
 * @param {string} sortBy Field to sort by.
 * @param {boolean} descending Sort in descending order.
 * @returns Embed with list of Pokemon, and components for pagination/selection.
 */

const list = async (
  interaction,
  page,
  filterBy,
  filterValue,
  sortBy,
  descending
) =>
  await createRoot(
    PokemonList,
    {
      user: getUserFromInteraction(interaction),
      initialPage: page,
      initialFilterBy: filterBy,
      initialFilterValue: filterValue,
      initialSortBy: sortBy,
      initialSortDescending: descending,
    },
    interaction,
    { ttl: 300 }
  );

const listMessageCommand = async (message) => {
  const args = message.content.split(" ");
  const page = args[1] ? parseInt(args[1], 10) : 1;
  const filterBy = args[2] ? args[2] : "none";
  const filterValue = args[3] ? args[3] : null;
  const sortBy = args[4] ? args[4] : null;
  const descending = args[5] === "true";
  return await list(message, page, filterBy, filterValue, sortBy, descending);
};

const listSlashCommand = async (interaction) => {
  const page = interaction.options.getInteger("page")
    ? interaction.options.getInteger("page")
    : 1;
  const filterBy = interaction.options.getString("filterby")
    ? interaction.options.getString("filterby")
    : "none";
  const filterValue = interaction.options.getString("filtervalue")
    ? interaction.options.getString("filtervalue")
    : null;
  const sortBy = interaction.options.getString("sortby")
    ? interaction.options.getString("sortby")
    : null;
  const descending = interaction.options.getBoolean("descending")
    ? interaction.options.getBoolean("descending")
    : false;
  return await list(
    interaction,
    page,
    filterBy,
    filterValue,
    sortBy,
    descending
  );
};

/* const list = async (user, page, filterBy, filterValue, sortBy, descending) => {
  // validate page
  if (page < 1) {
    return { embeds: null, err: "Page must be greater than 0." };
  }

  // get trainer
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { embed: null, err: trainer.err };
  }

  // build list options with page/sort/filter
  // casts filterValue to boolean if possible
  if (filterValue === "true" || filterValue === "True") {
    filterValue = true;
  } else if (filterValue === "false" || filterValue === "False") {
    filterValue = false;
  }
  const listOptions = {
    page,
  };
  // ignore filter if filterBy is not provided
  if (filterBy === "originalOwner") {
    const id = getUserId(filterValue);
    if (id === null) {
      return { embed: null, err: "Invalid user ID; must provide a @ mention." };
    }
    listOptions.filter = {
      originalOwner: id,
    };
  } else if (filterBy !== "none") {
    if (filterValue == null) {
      return {
        embed: null,
        err: "Filter value must be provided if filterBy is provided.",
      };
    }

    // if filtervalue is string , use regex
    if (typeof filterValue === "string") {
      listOptions.filter = {
        // fuzzy search for value
        [filterBy]: {
          $regex: RegExp(filterValue),
          $options: "i",
        },
      };
    } else {
      listOptions.filter = {
        [filterBy]: filterValue,
      };
    }
  }
  // build sort
  if (sortBy) {
    listOptions.sort = {
      [sortBy]: descending ? -1 : 1,
      _id: 1,
    };
  }

  // get list of pokemon
  const pokemons = await listPokemons(trainer.data, listOptions);
  if (pokemons.err) {
    return { embed: null, err: pokemons.err };
  }

  // build list embed
  const embed = buildPokemonListEmbed(trainer.data, pokemons.data, page);

  // build pagination row
  const stateId = setState(
    {
      userId: user.id,
      listOptions,
      lastPage: pokemons.lastPage,
      pokemonIds: pokemons.data.map((pokemon) => pokemon._id.toString()),
    },
    300
  );
  const scrollRowData = {
    stateId,
  };
  const scrollActionRow = buildScrollActionRow(
    page,
    pokemons.lastPage,
    scrollRowData,
    eventNames.POKEMON_SCROLL
  );

  // build select row
  const selectRowData = {
    stateId,
  };
  const pokemonSelectRow = buildPokemonSelectRow(
    pokemons.data,
    selectRowData,
    eventNames.POKEMON_LIST_SELECT
  );

  // build releast page
  const releasePageData = {
    stateId,
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

  const send = {
    content:
      "**[MOBILE USERS]** Select a pokemon to copy its ID (Hold message -> Copy Text).",
    embeds: [embed],
    components: [scrollActionRow, pokemonSelectRow, releasePageRow],
  };
  return { send, err: null };
};

const listMessageCommand = async (message) => {
  const args = message.content.split(" ");
  const page = args[1] ? parseInt(args[1], 10) : 1;
  const filterBy = args[2] ? args[2] : "none";
  const filterValue = args[3] ? args[3] : null;
  const sortBy = args[4] ? args[4] : null;
  const descending = args[5] === "true";
  const { send, err } = await list(
    message.author,
    page,
    filterBy,
    filterValue,
    sortBy,
    descending
  );
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const listSlashCommand = async (interaction) => {
  const page = interaction.options.getInteger("page")
    ? interaction.options.getInteger("page")
    : 1;
  const filterBy = interaction.options.getString("filterby")
    ? interaction.options.getString("filterby")
    : "none";
  const filterValue = interaction.options.getString("filtervalue")
    ? interaction.options.getString("filtervalue")
    : null;
  const sortBy = interaction.options.getString("sortby")
    ? interaction.options.getString("sortby")
    : null;
  const descending = interaction.options.getBoolean("descending")
    ? interaction.options.getBoolean("descending")
    : false;
  const { send, err } = await list(
    interaction.user,
    page,
    filterBy,
    filterValue,
    sortBy,
    descending
  );
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
}; */

module.exports = {
  message: listMessageCommand,
  slash: listSlashCommand,
};
