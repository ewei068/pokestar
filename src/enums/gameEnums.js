/** @typedef {Enum<trainerEventEnum>} TrainerEventEnum */
const trainerEventEnum = Object.freeze({
  CAUGHT_POKEMON: "caughtPokemon",
  DEFEATED_NPC: "defeatedNpc",
  UPGRADED_EQUIPMENT: "upgradedEquipment",
  EVOLVED_POKEMON: "evolvedPokemon",
});

/**
 * @template {TrainerEventEnum} K
 * @typedef {{
 *  [trainerEventEnum.CAUGHT_POKEMON]: {pokemons: WithId<Pokemon>[], method: "gacha" | "wild" | "mythic" |"other" },
 *  [trainerEventEnum.DEFEATED_NPC]: {npcId: NpcEnum, difficulty: NpcDifficultyEnum, type: NpcTypeEnum},
 *  [trainerEventEnum.UPGRADED_EQUIPMENT]: {equipment: Equipment},
 *  [trainerEventEnum.EVOLVED_POKEMON]: {pokemon: WithId<Pokemon>},
 * }[K] & {trainer: WithId<Trainer>}} TrainerEventArgsWithoutEventName
 */

/**
 * @template {TrainerEventEnum} K
 * @typedef {TrainerEventArgsWithoutEventName<K> & { eventName: K }} TrainerEventArgs
 */

module.exports = {
  trainerEventEnum,
};
