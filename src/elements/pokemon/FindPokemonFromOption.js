const {
  useEffect,
  useAwaitedMemo,
  createElement,
} = require("../../deact/deact");
const { buildPokemonListEmbed } = require("../../embeds/pokemonEmbeds");
const usePokemonListAndSelection = require("../../hooks/usePokemonListAndSelection");
const { getPokemonFromUserId } = require("../../services/pokemon");

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {CompactUser} param1.user
 * @param {(pokemon: WithId<Pokemon>) => any} param1.onPokemonFound
 * @param {string} param1.name
 */
const FindPokemonFromName = async (ref, { user, onPokemonFound, name }) => {
  const {
    page,
    pokemons,
    currentPokemon,
    setCurrentPokemon,
    err,
    selectMenuElement,
    scrollButtonsElement,
  } = await usePokemonListAndSelection(
    {
      userId: user.id,
      listOptions: {
        filter: {
          // fuzzy search for value
          name: {
            $regex: RegExp(name),
            $options: "i",
          },
        },
      },
    },
    ref
  );
  useEffect(
    () => {
      if (!currentPokemon && page === 1 && pokemons?.length === 1) {
        setCurrentPokemon(pokemons[0]);
      }
    },
    [currentPokemon, page, pokemons],
    ref
  );
  useEffect(
    () => {
      if (currentPokemon) {
        onPokemonFound(currentPokemon);
      }
    },
    [currentPokemon],
    ref
  );

  return {
    contents: [err],
    embeds: err ? [] : [buildPokemonListEmbed(user.username, pokemons, page)],
    components: [scrollButtonsElement, selectMenuElement],
  };
};

/**
 * @param {DeactElement} ref
 * @param {object} param1
 * @param {CompactUser} param1.user
 * @param {(pokemon: WithId<Pokemon>) => any} param1.onPokemonFound
 * @param {string} param1.option
 */
const FindPokemonFromOption = async (ref, { user, onPokemonFound, option }) => {
  const { data: pokemon } = await useAwaitedMemo(
    async () => getPokemonFromUserId(user.id, option),
    [user.id, option],
    ref
  );
  useEffect(
    () => {
      if (pokemon) {
        onPokemonFound(pokemon);
      }
    },
    [pokemon],
    ref
  );

  if (!pokemon) {
    return {
      elements: [
        createElement(FindPokemonFromName, {
          user,
          onPokemonFound,
          name: option,
        }),
      ],
    };
  }
  return {
    elements: [],
  };
};

module.exports = FindPokemonFromOption;
