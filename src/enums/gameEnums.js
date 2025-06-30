/** @typedef {Enum<gameEventEnum>} GameEventEnum */
const gameEventEnum = Object.freeze({
  CAUGHT_POKEMON: "caughtPokemon",
});

/**
 * @template {GameEventEnum} K
 * @typedef {{
 *  [gameEventEnum.CAUGHT_POKEMON]: { user: CompactUser, pokemons: WithId<Pokemon>[], method: "gacha" | "wild" | "other" },
 * }} GameEventArgsWithoutEventName
 */

/**
 * @template {GameEventEnum} K
 * @typedef {GameEventArgsWithoutEventName<K> & { eventName: K }} GameEventArgs
 */

module.exports = {
  gameEventEnum,
};
