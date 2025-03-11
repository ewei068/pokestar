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

/**
 * @param {BattlePokemon} pokemon
 */
const getIsSourcePokemonCallback = (pokemon) => (eventArgs) =>
  eventArgs?.source === pokemon;

/**
 * @param {"move" | "effect"} instanceType
 */
const getIsInstanceOfType = (instanceType) => (eventArgs) => {
  // I shouldn't have made the infos different but it's too late now
  const eventInfo = eventArgs?.damageInfo || eventArgs?.healInfo || {};
  return eventInfo?.type === instanceType;
};

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
  getIsSourcePokemonCallback,
  getIsInstanceOfType,
  composeConditionCallbacks,
  anyConditionCallbacks,
};
