/** @typedef {Enum<trainerEventEnum>} TrainerEventEnum */
const trainerEventEnum = Object.freeze({
  CAUGHT_POKEMON: "caughtPokemon",
  DEFEATED_NPC: "defeatedNpc",
});

/**
 * @template {TrainerEventEnum} K
 * @typedef {{
 *  [trainerEventEnum.CAUGHT_POKEMON]: {pokemons: WithId<Pokemon>[], method: "gacha" | "wild" | "other" },
 *  [trainerEventEnum.DEFEATED_NPC]: {npcId: string, difficulty: NpcDifficultyEnum, type: "pve" | "dungoen" | "raid" | "battletower"},
 * }[K] & {trainer: WithId<Trainer>}} TrainerEventArgsWithoutEventName
 */

/**
 * @template {TrainerEventEnum} K
 * @typedef {TrainerEventArgsWithoutEventName<K> & { eventName: K }} TrainerEventArgs
 */

module.exports = {
  trainerEventEnum,
};
