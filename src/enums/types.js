/**
 * @typedef {import("./battleEnums").AllMoveIdEnum} AllMoveIdEnum
 * @typedef {Keys<typeof import("../battle/data/moves").movesToRegister> | import("../config/battleConfig").LegacyMoveIdEnum} MoveIdEnum
 * @typedef {import("./battleEnums").EffectIdEnum} EffectIdEnum
 * @typedef {import("./battleEnums").AbilityIdEnum} AbilityIdEnum
 * @typedef {import("./battleEnums").BattleEventEnum} BattleEventEnum
 * @typedef {import("./pokemonEnums").AllPokemonIdEnum} AllPokemonIdEnum
 * @typedef {import("./battleEnums").HeldItemIdEnum} HeldItemIdEnum
 * @typedef {import("./miscEnums").UpsellEnum} UpsellEnum
 * @typedef {import("./gameEnums").TrainerEventEnum} TrainerEventEnum
 */

/**
 * @template {BattleEventEnum} K
 * @typedef {import("./battleEnums").BattleEventArgsWithoutEventName<K>} BattleEventArgsWithoutEventName
 */

/**
 * @template {BattleEventEnum} K
 * @typedef {import("./battleEnums").BattleEventArgs<K>} BattleEventArgs
 */

/**
 * @template {TrainerEventEnum} K
 * @typedef {import("./gameEnums").TrainerEventArgsWithoutEventName<K>} TrainerEventArgsWithoutEventName
 */

/**
 * @template {TrainerEventEnum} K
 * @typedef {import("./gameEnums").TrainerEventArgs<K>} TrainerEventArgs
 */
