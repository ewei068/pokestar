const { useAwaitedMemo, useState, useCallback } = require("../deact/deact");
const { getPokemonFromUserId } = require("../services/pokemon");

/**
 * @param {string} pokemonId
 * @param {string} userId
 * @param {DeactElement} ref
 * @returns {Promise<{
 *  pokemon: WithId<Pokemon>,
 *  setPokemon: (pokemon: Pokemon) => void,
 *  refreshPokemon: () => Promise<{ pokemon?: WithId<Pokemon>, err?: string }>,
 *  err?: string
 * }>}
 */
const usePokemon = async (pokemonId, userId, ref) => {
  // TODO: got to current tutorial stage
  const { data: initialPokemon, err } = await useAwaitedMemo(
    async () => getPokemonFromUserId(userId, pokemonId),
    [],
    ref
  );
  const [pokemon, setPokemon] = useState(initialPokemon, ref);

  const refreshPokemon = useCallback(
    async () => {
      const { data: newPokemon, err: newErr } = await getPokemonFromUserId(
        userId,
        pokemonId
      );
      if (newErr) {
        return { err: newErr };
      }

      setPokemon(newPokemon);
      return { pokemon: newPokemon };
    },
    [userId, pokemonId, setPokemon],
    ref
  );

  return { pokemon, setPokemon, err, refreshPokemon };
};

module.exports = usePokemon;
