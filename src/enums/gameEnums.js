/** @typedef {Enum<trainerEventEnum>} TrainerEventEnum */
const trainerEventEnum = Object.freeze({
  CAUGHT_POKEMON: "caughtPokemon",
  DEFEATED_NPC: "defeatedNpc",
  STARTED_AUTO_BATTLE: "startedAutoBattle",
  PARTICIPATED_IN_BATTLE: "participatedInBattle",
  UPGRADED_EQUIPMENT: "upgradedEquipment",
  REROLLED_EQUIPMENT: "rerolledEquipment",
  EVOLVED_POKEMON: "evolvedPokemon",
  TRAINED_POKEMON: "trainedPokemon",
  MADE_PURCHASE: "madePurchase",
  CLAIMED_DAILY_REWARDS: "claimedDailyRewards",
});

/**
 * @template {TrainerEventEnum} K
 * @typedef {{
 *  [trainerEventEnum.CAUGHT_POKEMON]: {pokemons: WithId<Pokemon>[], method: "gacha" | "wild" | "mythic" |"other" },
 *  [trainerEventEnum.DEFEATED_NPC]: {npcId: NpcEnum, difficulty: NpcDifficultyEnum, type: NpcTypeEnum},
 *  [trainerEventEnum.STARTED_AUTO_BATTLE]: {dreamCards: number, npcId: NpcEnum},
 *  [trainerEventEnum.PARTICIPATED_IN_BATTLE]: {type: NpcTypeEnum | "pvp" | "other"},
 *  [trainerEventEnum.UPGRADED_EQUIPMENT]: {equipment: Equipment},
 *  [trainerEventEnum.REROLLED_EQUIPMENT]: {equipment: Equipment},
 *  [trainerEventEnum.EVOLVED_POKEMON]: {pokemon: WithId<Pokemon>},
 *  [trainerEventEnum.TRAINED_POKEMON]: {pokemon: WithId<Pokemon>, exp: number, evs: StatArray},
 *  [trainerEventEnum.MADE_PURCHASE]: { itemId: ShopItemEnum, level?: number, quantity: number },
 *  [trainerEventEnum.CLAIMED_DAILY_REWARDS]: {},
 * }[K] & {trainer: WithId<Trainer>}} TrainerEventArgsWithoutEventName
 */

/**
 * @template {TrainerEventEnum} K
 * @typedef {TrainerEventArgsWithoutEventName<K> & { eventName: K }} TrainerEventArgs
 */

module.exports = {
  trainerEventEnum,
};
