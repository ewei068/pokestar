const {
  useState,
  createElement,
  useCallbackBinding,
  useMemo,
} = require("../deact/deact");
const IdConfigSelectMenu = require("../elements/foundation/IdConfigSelectMenu");
const usePokemonList = require("./usePokemonList");
const { pokemonConfig } = require("../config/pokemonConfig");
const Fragment = require("../deact/elements/Fragement");
// eslint-disable-next-line no-unused-vars
const { listPokemons } = require("../services/pokemon");

/**
 * @param {object} param0
 * @param {number=} param0.initialPage
 * @param {number=} param0.pageSize
 * @param {WithId<Trainer>} param0.trainer
 * @param {(Parameters<typeof listPokemons>)[1]=} param0.listOptions
 * @param {((string) => any)=} param0.onError
 * @param {string=} param0.selectionPlaceholder
 * @param {boolean=} param0.useCurrentPokemonDefault
 * @param {boolean=} param0.showId
 * @param {CallbackBindingOptions=} param0.paginationCallbackOptions
 * @param {CallbackBindingOptions=} param0.selectionCallbackOptions
 * @param {WithId<Pokemon>=} param0.initialPokemon
 * @param {DeactElement} ref
 * @returns {Promise<Awaited<ReturnType<typeof usePokemonList>> & {
 *  currentPokemon: WithId<Pokemon>,
 *  setCurrentPokemon: (pokemon: WithId<Pokemon>) => void,
 *  selectMenuElement: CreateElementResult,
 * }>}
 */
const usePokemonListAndSelection = async (
  {
    initialPage = 1,
    pageSize = 10,
    trainer,
    listOptions = {},
    onError = () => {},
    initialPokemon,
    selectionPlaceholder = "Select a Pokemon",
    useCurrentPokemonDefault = false,
    showId = true,
    paginationCallbackOptions = {},
    selectionCallbackOptions = {},
  },
  ref
) => {
  const [currentPokemon, setCurrentPokemon] = useState(initialPokemon, ref);
  const pagination = await usePokemonList(
    {
      initialPage,
      pageSize,
      trainer,
      listOptions,
      onError,
      callbackOptions: paginationCallbackOptions,
    },
    ref
  );
  const { pokemons, err } = pagination;

  const onSelectKey = useCallbackBinding(
    (interaction) => {
      // @ts-ignore ts is stupid
      const id = interaction?.values?.[0];
      setCurrentPokemon(pokemons.find((p) => p._id.toString() === id));
    },
    ref,
    selectionCallbackOptions
  );

  const shouldShowSelectMenu = pokemons?.length && !err;
  const pokemonIds = useMemo(
    () => (shouldShowSelectMenu ? pokemons.map((p) => p._id.toString()) : []),
    [pokemons, shouldShowSelectMenu],
    ref
  );
  const pokemonsConfig = useMemo(
    () =>
      pokemons.reduce(
        (acc, p) => ({
          ...acc,
          [p._id.toString()]: {
            ...pokemonConfig[p.speciesId],
            name: p.name,
          },
        }),
        {}
      ),
    [pokemons, shouldShowSelectMenu],
    ref
  );

  const selectMenuElement = shouldShowSelectMenu
    ? createElement(IdConfigSelectMenu, {
        ids: pokemonIds,
        placeholder: selectionPlaceholder,
        config: pokemonsConfig,
        callbackBindingKey: onSelectKey,
        showId,
        defaultId: useCurrentPokemonDefault
          ? currentPokemon?.id?.toString()
          : undefined,
      })
    : createElement(Fragment, {});

  return {
    ...pagination,
    currentPokemon,
    setCurrentPokemon,
    selectMenuElement,
  };
};

module.exports = usePokemonListAndSelection;
