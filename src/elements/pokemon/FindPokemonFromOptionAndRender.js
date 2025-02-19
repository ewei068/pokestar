const { useState, createElement } = require("../../deact/deact");
const FindPokemonFromOption = require("./FindPokemonFromOption");

/**
 * @template T
 * @typedef {Omit<Omit<Omit<T, "pokemon">, "pokemonId">, "setPokemon">} PropsOmitted
 */

/**
 * @template T
 * @template {DeactElementFunction<T>} U
 * @param {DeactElement} ref
 * @param {{
 *  user: CompactUser,
 *  option: string,
 *  element: U
 * } & PropsOmitted<DeactElementProps<U>>} props
 */
const FindPokemonFromOptionAndRender = async (ref, props) => {
  const { user, option, element } = props;
  const [pokemon, setPokemon] = useState(null, ref);
  if (pokemon) {
    return {
      elements: [
        // @ts-ignore
        createElement(element, {
          ...props,
          pokemon,
          pokemonId: pokemon._id.toString(),
          setPokemon,
        }),
      ],
    };
  }
  return {
    elements: [
      createElement(FindPokemonFromOption, {
        user,
        option,
        onPokemonFound: setPokemon,
      }),
    ],
  };
};

module.exports = FindPokemonFromOptionAndRender;
