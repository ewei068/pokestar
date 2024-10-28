/* eslint-disable-next-line no-unused-vars */
const { User } = require("discord.js");
const {
  useState,
  useAwaitedMemo,
  useMemo,
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
    if (filterValue == null || filterValue === "") {
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

const getUpdatedListOptionsWithFilter = (
  oldListOptions,
  filterBy,
  filterValue
) => {
  const rv = {
    ...oldListOptions,
    filter: {
      ...(oldListOptions.filter || {}),
    },
  };
  const newFilter = parseFilter(filterBy, filterValue);
  if (newFilter.err) {
    return { err: newFilter.err };
  }
  if (!newFilter.filter?.[filterBy]) {
    delete rv.filter[filterBy];
  } else {
    rv.filter[filterBy] = newFilter.filter[filterBy];
  }

  return rv;
};

const parseSort = (sortBy, sortDescending) => {
  if (sortBy) {
    const sort = {};
    sort[sortBy] = sortDescending ? -1 : 1;
    sort._id = 1;
    return sort;
  }
};

const getInitialListOptions = (
  filterBy,
  inputFilterValue,
  sortBy,
  sortDescending
) => {
  const listOptions = {};
  // build initial filter
  const filterRes = parseFilter(filterBy, inputFilterValue);
  if (filterRes.err) {
    return { err: filterRes.err };
  }
  listOptions.filter = filterRes.filter;

  // build initial sort
  const sort = parseSort(sortBy, sortDescending);
  listOptions.sort = sort;
  return listOptions;
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
  const initialListOptions = useMemo(
    () =>
      getInitialListOptions(
        initialFilterBy,
        initialFilterValue,
        initialSortBy,
        initialSortDescending
      ),
    [], // no deps because should only run once
    ref
  );
  if (initialListOptions.err) {
    return { err: initialListOptions.err };
  }
  const [listOptions, setListOptions] = useState(initialListOptions, ref);

  const trainerRes = await useAwaitedMemo(() => getTrainer(user), [user], ref);
  if (trainerRes.err) {
    return { err: trainerRes.err };
  }
  const trainer = trainerRes.data;

  // get list of pokemon
  const pokemonsRes = await useAwaitedMemo(
    () =>
      listPokemons(trainer, {
        ...listOptions,
        page,
      }),
    [trainer, listOptions, page],
    ref
  );
  const pokemonsErr = pokemonsRes.err;
  const pokemons = pokemonsRes.data;

  const prevActionBindng = useCallbackBinding(() => {
    setPage(page - 1);
  }, ref);
  const nextActionBindng = useCallbackBinding(() => {
    setPage(page + 1);
  }, ref);
  const searchSubmittedActionBinding = useModalSubmitCallbackBinding(
    (interaction) => {
      const pokemonSearchInput =
        interaction.fields.getTextInputValue("pokemonSearchInput");
      const updatedListOptions = getUpdatedListOptionsWithFilter(
        listOptions,
        "name",
        pokemonSearchInput
      );
      if (updatedListOptions.err) {
        return { err: updatedListOptions.err };
      }
      setListOptions(updatedListOptions);
    },
    ref
  );
  const openSearchModalBinding = useCallbackBinding(
    (interaction) => {
      const currentName = listOptions.filter?.name?.$regex?.source;
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

  // legacy button
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
          emoji: "🔎",
          callbackBindingKey: openSearchModalBinding,
          data: {},
        }),
      ],
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
