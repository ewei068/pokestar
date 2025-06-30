/** @typedef {Enum<gameEventEnum>} GameEventEnum */
const gameEventEnum = Object.freeze({
  CAUGHT_POKEMON: "caughtPokemon",
  DEFEATED_NPC: "defeatedNpc",
});

/**
 * @template {GameEventEnum} K
 * @typedef {{
 *  [gameEventEnum.CAUGHT_POKEMON]: { user: CompactUser, pokemons: WithId<Pokemon>[], method: "gacha" | "wild" | "other" },
 *  [gameEventEnum.DEFEATED_NPC]: { user: CompactUser, npcId: string, difficulty: NpcDifficultyEnum, type: "pve" | "dungoen" | "raid" | "battletower"},
 * }} GameEventArgsWithoutEventName
 */

/**
 * @template {GameEventEnum} K
 * @typedef {GameEventArgsWithoutEventName<K> & { eventName: K }} GameEventArgs
 */

module.exports = {
  gameEventEnum,
};
