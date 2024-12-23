/**
 * @param {Battle} battle
 * @param {BattlePokemon} pokemon
 */
const getIsActivePokemonCallback = (battle, pokemon) => () =>
  battle.activePokemon === pokemon;

/**
 * @param {BattlePokemon} pokemon
 */
const getIsTargetPokemonCallback = (pokemon) => (eventArgs) =>
  eventArgs?.target === pokemon;

module.exports = {
  getIsActivePokemonCallback,
  getIsTargetPokemonCallback,
};
