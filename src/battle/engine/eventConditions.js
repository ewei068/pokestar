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

const composeConditionCallbacks =
  (...conditionCallbacks) =>
  (eventArgs) =>
    conditionCallbacks.every((conditionCallback) =>
      conditionCallback(eventArgs)
    );

const anyConditionCallbacks =
  (...conditionCallbacks) =>
  (eventArgs) =>
    conditionCallbacks.some((conditionCallback) =>
      conditionCallback(eventArgs)
    );

module.exports = {
  getIsActivePokemonCallback,
  getIsTargetPokemonCallback,
  composeConditionCallbacks,
  anyConditionCallbacks,
};
