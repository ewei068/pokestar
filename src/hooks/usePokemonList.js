const {
  useState,
  createElement,
  useCallbackBinding,
  useAwaitedMemo,
} = require("../deact/deact");
const {
  listPokemonsFromTrainer: listPokemons,
} = require("../services/pokemon");
const ScrollButtons = require("../elements/foundation/ScrollButtons");

/**
 * @param {object} param0
 * @param {number=} param0.initialPage
 * @param {number=} param0.pageSize
 * @param {WithId<Trainer>} param0.trainer
 * @param {(Parameters<typeof listPokemons>)[1]=} param0.listOptions
 * @param {((string) => any)=} param0.onError
 * @param {CallbackBindingOptions=} param0.callbackOptions
 * @param {DeactElement} ref
 * @returns {Promise<{
 *  page: number,
 *  setPage: (page: number) => void,
 *  pokemons: WithId<Pokemon>[],
 *  scrollButtonsElement: CreateElementResult,
 *  err?: string,
 * }>}
 */
const usePokemonList = async (
  {
    initialPage = 1,
    pageSize = 10,
    trainer,
    listOptions = {},
    onError = () => {},
    callbackOptions = {},
  },
  ref
) => {
  const minPage = 1;
  const [page, setPage] = useState(initialPage, ref);
  const pageClamped = Math.max(minPage, page);
  const prevActionBindng = useCallbackBinding(
    () => {
      setPage(pageClamped - 1);
    },
    ref,
    callbackOptions
  );
  const nextActionBindng = useCallbackBinding(
    () => {
      setPage(pageClamped + 1);
    },
    ref,
    callbackOptions
  );
  // get list of pokemon
  const pokemonsRes = await useAwaitedMemo(
    () =>
      // @ts-ignore
      listPokemons(trainer, {
        ...listOptions,
        page,
        pageSize,
      }),
    [trainer, listOptions, page, pageSize],
    ref
  );
  const pokemonsErr = pokemonsRes.err;
  if (pokemonsErr) {
    onError(pokemonsErr);
  }
  const pokemons = pokemonsRes.data;

  const scrollButtonsElement = createElement(ScrollButtons, {
    onPrevPressedKey: prevActionBindng,
    onNextPressedKey: nextActionBindng,
    isPrevDisabled: !!pokemonsErr || page === 1,
    isNextDisabled: !!pokemonsErr || pokemonsRes.lastPage,
  });
  return {
    page: pageClamped,
    setPage,
    pokemons,
    scrollButtonsElement,
    err: pokemonsErr,
  };
};

module.exports = usePokemonList;
