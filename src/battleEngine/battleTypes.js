/**
 * @typedef {import("../enums/battleEnums").MoveIdEnum} MoveIdEnum
 * @typedef {import("../enums/battleEnums").EffectIdEnum} EffectIdEnum
 * @typedef {import("../services/battle").Battle} Battle
 * @typedef {import("../services/battle").Pokemon} BattlePokemon
 * @typedef {import("./battleConfig").BattleEventEnum} BattleEventEnum
 * @typedef {import("./battleConfig").DamageTypeEnum} DamageTypeEnum
 * @typedef {import("./battleConfig").MoveTierEnum} MoveTierEnum
 * @typedef {import("./battleConfig").StatusConditionEnum} StatusConditionEnum
 * @typedef {import("./battleConfig").TargetTypeEnum} TargetTypeEnum
 * @typedef {import("./battleConfig").TargetPositionEnum} TargetPositionEnum
 * @typedef {import("./battleConfig").TargetPatternEnum} TargetPatternEnum
 * @typedef {import("./battleConfig").EffectTypeEnum} EffectTypeEnum
 * @typedef {{battle: Battle, source: BattlePokemon, target: BattlePokemon}} EffectAddBasicArgs
 * @typedef {{battle: Battle, target: BattlePokemon}} EffectRemoveBasicArgs
 * @typedef {typeof import("./effects").effectsToRegister} RegisteredEffects
 * @typedef {import("./moves").Move} Move
 */

/**
 * @template T
 * @template U
 * @typedef {import("./effects").Effect<T, U>} Effect
 */

/**
 * @template T
 * @typedef {T extends Effect<infer U, infer V> ? U : never} EffectInitialArgsType
 */

/**
 * @template T
 * @typedef {T extends Effect<infer U, infer V> ? V | {} : never} EffectPropertiesType
 */

/**
 * @template {EffectIdEnum} K
 * @typedef {K extends keyof RegisteredEffects ? EffectInitialArgsType<RegisteredEffects[K]> : any} EffectInitialArgsTypeFromId
 */

/**
 * @template {EffectIdEnum} K
 * @typedef {K extends keyof RegisteredEffects ? EffectPropertiesType<RegisteredEffects[K]> : any} EffectPropertiesTypeFromId
 */

/**
 *
 * @template T
 * @template U
 * @callback EffectAddCallback
 * @this {Effect<T, any>} // not having any bugs out the template
 * @param {object} param0
 * @param {Battle} param0.battle
 * @param {BattlePokemon} param0.source
 * @param {BattlePokemon} param0.target
 * @param {T} param0.initialArgs
 * @returns {U}
 */

/**
 * @template T
 * @template U
 * @callback EffectRemoveCallback
 * @this {Effect<T, U>}
 * @param {object} param0
 * @param {Battle} param0.battle
 * @param {BattlePokemon} param0.target
 * @param {T} param0.initialArgs
 * @param {U} param0.properties
 */

/**
 * @callback MoveExecute
 * @this {Move}
 * @param {object} param0
 * @param {Battle} param0.battle
 * @param {BattlePokemon} param0.source
 * @param {BattlePokemon} param0.primaryTarget
 * @param {Array<BattlePokemon>} param0.allTargets
 * @param {Array<BattlePokemon>} param0.missedTargets
 */
