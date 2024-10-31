/* eslint-disable-next-line no-unused-vars */
const { User, ButtonStyle } = require("discord.js");
const {
  useState,
  useAwaitedMemo,
  useCallbackBinding,
  createElement,
  createModal,
  useModalSubmitCallbackBinding,
} = require("../../deact/deact");
const { getTrainer } = require("../../services/trainer");
const { getUserId } = require("../../utils/utils");
const { listPokemons } = require("../../services/pokemon");
const { buildPokemonListEmbed } = require("../../embeds/pokemonEmbeds");
const ScrollButtons = require("../foundation/ScrollButtons");
const { eventNames } = require("../../config/eventConfig");
const { buildPokemonSelectRow } = require("../../components/pokemonSelectRow");
const { buildPokemonSearchModal } = require("../../modals/pokemonModals");
const Button = require("../../deact/elements/Button");
const { rarities } = require("../../config/pokemonConfig");

const sortByOptionOrder = [
  "ivTotal",
  "combatPower",
  "level",
  "name",
  "pokedexOrder",
];

const sortByConfig = {
  ivTotal: {
    label: "IVs",
    value: "ivTotal",
  },
  combatPower: {
    label: "Power",
    value: "combatPower",
  },
  level: {
    label: "Level",
    value: "level",
  },
  name: {
    label: "Name",
    value: "name",
  },
  pokedexOrder: {
    label: "Pokedex",
    value: "pokedexOrder",
  },
};

const parseFilter = (filterBy, inputFilterValue) => {
  // casts filterValue to boolean if possible
  let filter;
  let filterValue = inputFilterValue;
  if (filterValue === "true" || filterValue === "True") {
    filterValue = true;
  } else if (filterValue === "false" || filterValue === "False") {
    filterValue = false;
  }
  // ignore filter if filterBy is not provided
  if (filterBy === "originalOwner") {
    const id = getUserId(filterValue);
    if (id === null) {
      return { err: "Invalid user ID; must provide a @ mention." };
    }
    filter = {
      originalOwner: id,
    };
  } else if (filterBy !== "none") {
    if (
      filterValue === null ||
      filterValue === undefined ||
      filterValue === ""
    ) {
      return {};
    }

    // if filtervalue is string , use regex
    if (typeof filterValue === "string") {
      filter = {
        // fuzzy search for value
        [filterBy]: {
          $regex: RegExp(filterValue),
          $options: "i",
        },
      };
    } else {
      filter = {
        [filterBy]: filterValue,
      };
    }
  }
  return { filter };
};

const parseSort = (sortBy, sortDescending) => {
  if (sortBy) {
    const sort = {};
    sort[sortBy] = sortDescending ? -1 : 1;
    sort._id = 1;
    return sort;
  }
};

const computeListOptions = (page, filter, sort) => {
  const listOptions = {
    page,
    filter: {},
    sort: parseSort(sort.sortBy, sort.sortDescending),
  };

  // compute filter
  for (const [filterBy, filterValue] of Object.entries(filter)) {
    const filterRes = parseFilter(filterBy, filterValue);
    if (filterRes.err) {
      return { err: filterRes.err };
    }
    if (filterRes.filter?.[filterBy] !== undefined) {
      listOptions.filter[filterBy] = filterRes.filter[filterBy];
    }
  }
  return listOptions;
};

const getDefaultFilterColor = (filterValue) => {
  if (filterValue === true) {
    return ButtonStyle.Success;
  }
  if (filterValue === false) {
    return ButtonStyle.Danger;
  }
  return ButtonStyle.Secondary;
};

/**
 * @type {DeactElementFunction<{
 *  user: User,
 *  initialPage?: number,
 *  initialFilterBy?: string,
 *  initialFilterValue?: string | boolean,
 *  initialSortBy?: string,
 *  initialSortDescending?: boolean
 * }>}
 */
module.exports = async (
  ref,
  {
    user,
    initialPage = 1,
    initialFilterBy,
    initialFilterValue,
    initialSortBy,
    initialSortDescending = false,
  }
) => {
  const [page, setPage] = useState(initialPage, ref);
  const [filtersShown, setFiltersShown] = useState(false, ref);
  const initialFilter = {};
  if (initialFilterBy) {
    initialFilter[initialFilterBy] = initialFilterValue;
  }
  const [filter, setFilter] = useState(initialFilter, ref);
  const [sort, setSort] = useState(
    {
      sortBy: initialSortBy,
      sortDescending: initialSortDescending,
    },
    ref
  );

  const trainerRes = await useAwaitedMemo(() => getTrainer(user), [user], ref);
  if (trainerRes.err) {
    return { err: trainerRes.err };
  }
  const trainer = trainerRes.data;

  // get list of pokemon
  const pokemonsRes = await useAwaitedMemo(
    () => listPokemons(trainer, computeListOptions(page, filter, sort)),
    [trainer, filter, sort, page],
    ref
  );
  const pokemonsErr = pokemonsRes.err;
  const pokemons = pokemonsRes.data;

  // row 1 -- general
  const settingsActionBinding = useCallbackBinding(() => {
    setFiltersShown(!filtersShown);
  }, ref);
  const clearFiltersActionBinding = useCallbackBinding(() => {
    setFilter({});
    setSort({
      sortBy: undefined,
      sortDescending: false,
    });
  }, ref);

  // row 2 -- filter
  const searchSubmittedActionBinding = useModalSubmitCallbackBinding(
    (interaction) => {
      const pokemonSearchInput =
        interaction.fields.getTextInputValue("pokemonSearchInput");
      setFilter({
        ...filter,
        name: pokemonSearchInput,
      });
    },
    ref
  );
  const openSearchModalBinding = useCallbackBinding(
    (interaction) => {
      const currentName = filter.name;
      return createModal(
        buildPokemonSearchModal,
        {
          value: currentName,
          required: false,
        },
        searchSubmittedActionBinding,
        interaction,
        ref
      );
    },
    ref,
    { defer: false }
  );
  const filterButtonActionBinding = useCallbackBinding((interaction, data) => {
    const { filterBy } = data;
    let filterValue;
    if (filterBy === "rarity") {
      const currentRarity = filter.rarity;
      if (currentRarity === rarities.COMMON) {
        filterValue = rarities.RARE;
      } else if (currentRarity === rarities.RARE) {
        filterValue = rarities.EPIC;
      } else if (currentRarity === rarities.EPIC) {
        filterValue = rarities.LEGENDARY;
      } else if (currentRarity === rarities.LEGENDARY) {
        filterValue = rarities.MYTHICAL;
      } else if (currentRarity === rarities.MYTHICAL) {
        filterValue = undefined;
      } else {
        filterValue = rarities.COMMON;
      }
    } else {
      // eslint-disable-next-line no-lonely-if -- readability
      if (filter[filterBy] === true) {
        filterValue = false;
      } else if (filter[filterBy] === false) {
        filterValue = undefined;
      } else {
        filterValue = true;
      }
    }

    setFilter({
      ...filter,
      [filterBy]: filterValue,
    });
  }, ref);

  // row 3 -- sort
  const sortSelectActionBinding = useCallbackBinding(() => {
    const currentSortBy = sort.sortBy;
    let sortBy;
    // go through the list of sort options
    if (!currentSortBy) {
      [sortBy] = sortByOptionOrder;
    } else {
      for (let i = 0; i < sortByOptionOrder.length; i += 1) {
        if (sortByOptionOrder[i] === currentSortBy) {
          if (i + 1 < sortByOptionOrder.length) {
            sortBy = sortByOptionOrder[i + 1];
          } else {
            sortBy = undefined;
          }
          break;
        }
      }
    }

    setSort({
      ...sort,
      sortBy,
    });
  }, ref);
  const sortOrderActionBinding = useCallbackBinding(() => {
    setSort({
      ...sort,
      sortDescending: !sort.sortDescending,
    });
  }, ref);

  // row 4 -- page
  const prevActionBindng = useCallbackBinding(() => {
    setPage(page - 1);
  }, ref);
  const nextActionBindng = useCallbackBinding(() => {
    setPage(page + 1);
  }, ref);

  // row 5 -- legacy select pokemon button
  const selectRowData = {
    stateId: ref.rootInstance.stateId,
  };

  return {
    elements: [
      {
        content:
          pokemonsErr ||
          "**[MOBILE USERS]** Select a pokemon to copy its ID (Hold message -> Copy Text).",
        embeds: pokemonsErr
          ? []
          : [buildPokemonListEmbed(trainer, pokemons, page)],
      },
    ],
    components: [
      [
        createElement(Button, {
          emoji: "⚙️",
          callbackBindingKey: settingsActionBinding,
          style: filtersShown ? ButtonStyle.Primary : ButtonStyle.Secondary,
          data: {},
        }),
        createElement(Button, {
          emoji: "❌",
          callbackBindingKey: clearFiltersActionBinding,
          style: ButtonStyle.Secondary,
          data: {},
        }),
      ],
      filtersShown
        ? [
            // TODO: componentify?
            createElement(Button, {
              emoji: "🔎",
              callbackBindingKey: openSearchModalBinding,
              style: filter.name ? ButtonStyle.Primary : ButtonStyle.Secondary,
              data: {},
            }),
            createElement(Button, {
              emoji: "✨",
              callbackBindingKey: filterButtonActionBinding,
              style: getDefaultFilterColor(filter.shiny),
              data: { filterBy: "shiny" },
            }),
            createElement(Button, {
              label: filter.rarity || "Rarity",
              callbackBindingKey: filterButtonActionBinding,
              style: filter.rarity
                ? ButtonStyle.Primary
                : ButtonStyle.Secondary,
              data: { filterBy: "rarity" },
            }),
            createElement(Button, {
              emoji: "🔒",
              callbackBindingKey: filterButtonActionBinding,
              style: getDefaultFilterColor(filter.locked),
              data: { filterBy: "locked" },
            }),
          ]
        : [],
      filtersShown
        ? [
            createElement(Button, {
              label: sortByConfig[sort.sortBy]?.label || "Sort By",
              callbackBindingKey: sortSelectActionBinding,
              style: sort.sortBy ? ButtonStyle.Primary : ButtonStyle.Secondary,
              data: { sortBy: "name" },
            }),
            createElement(Button, {
              emoji: sort.sortDescending ? "⬇️" : "⬆️",
              callbackBindingKey: sortOrderActionBinding,
              data: {},
            }),
          ]
        : [],
      createElement(ScrollButtons, {
        onPrevPressedKey: prevActionBindng,
        onNextPressedKey: nextActionBindng,
        isPrevDisabled: !!pokemonsErr || page === 1,
        isNextDisabled: !!pokemonsErr || pokemonsRes.lastPage,
      }),
      pokemonsErr
        ? []
        : buildPokemonSelectRow(
            pokemons,
            selectRowData,
            eventNames.POKEMON_LIST_SELECT
          ),
    ],
  };
};
