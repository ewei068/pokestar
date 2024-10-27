/* eslint-disable-next-line no-unused-vars */
const { User } = require("discord.js");
const {
  useState,
  useAwaitedMemo,
  useMemo,
  useCallbackBinding,
  createElement,
} = require("../../deact/deact");
const { getTrainer } = require("../../services/trainer");
const { getUserId } = require("../../utils/utils");
const { listPokemons } = require("../../services/pokemon");
const { buildPokemonListEmbed } = require("../../embeds/pokemonEmbeds");
const ScrollButtons = require("../foundation/ScrollButtons");
const { eventNames } = require("../../config/eventConfig");
const { buildPokemonSelectRow } = require("../../components/pokemonSelectRow");

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
    if (filterValue == null) {
      return {
        err: "Filter value must be provided if filterBy is provided.",
      };
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
  const [listOptions] = useState(initialListOptions, ref);

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
  if (pokemonsRes.err) {
    return { err: pokemonsRes.err };
  }
  const pokemons = pokemonsRes.data;

  const prevActionBindng = useCallbackBinding(() => {
    setPage(page - 1);
  }, ref);
  const nextActionBindng = useCallbackBinding(() => {
    setPage(page + 1);
  }, ref);

  // legacy button
  const selectRowData = {
    stateId: ref.rootInstance.stateId,
  };

  return {
    elements: [
      {
        content:
          "**[MOBILE USERS]** Select a pokemon to copy its ID (Hold message -> Copy Text).",
        embeds: [buildPokemonListEmbed(trainer, pokemons, page)],
      },
    ],
    components: [
      createElement(ScrollButtons, {
        onPrevPressedKey: prevActionBindng,
        onNextPressedKey: nextActionBindng,
        isPrevDisabled: page === 1,
        isNextDisabled: pokemonsRes.lastPage,
      }),
      buildPokemonSelectRow(
        pokemons,
        selectRowData,
        eventNames.POKEMON_LIST_SELECT
      ),
    ],
  };
};
