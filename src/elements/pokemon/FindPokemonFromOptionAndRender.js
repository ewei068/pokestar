const { useState, createElement } = require("../../deact/deact");
const FindPokemonFromOption = require("./FindPokemonFromOption");

/**
 * @template T
 * @param {DeactElement} ref
 * @param {{
 *  user: CompactUser,
 *  option: string,
 *  element: DeactElementFunction<T>
 * } & DeactElementProps<T>} props
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
