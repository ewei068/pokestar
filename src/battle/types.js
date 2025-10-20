/**
 * @typedef {import("./engine/Battle").Battle} Battle
 * @typedef {import("./engine/BattlePokemon").BattlePokemon} BattlePokemon
 * @typedef {import("./engine/npcs").BattleNPC} BattleNPC
 * @typedef {import("./engine/MoveInstance").MoveInstance} MoveInstance
 * @typedef {import("./engine/MoveInstance").MoveInstanceId} MoveInstanceId
 * @typedef {(...args: Parameters<BattlePokemon['calculateMoveDamage']>) => ReturnType<BattlePokemon['calculateMoveDamage']>} CalculateMoveDamageImpl
 */

/**
 * @typedef {import("../config/battleConfig").DamageTypeEnum} DamageTypeEnum
 * @typedef {import("../config/battleConfig").MoveTierEnum} MoveTierEnum
 * @typedef {import("../config/battleConfig").StatusConditionEnum} StatusConditionEnum
 * @typedef {import("../config/battleConfig").WeatherConditionEnum} WeatherConditionEnum
 * @typedef {import("../config/battleConfig").TargetTypeEnum} TargetTypeEnum
 * @typedef {import("../config/battleConfig").TargetPositionEnum} TargetPositionEnum
 * @typedef {import("../config/battleConfig").TargetPatternEnum} TargetPatternEnum
 * @typedef {import("../config/battleConfig").EffectTypeEnum} EffectTypeEnum
 */

/**
 * @typedef {{battle: Battle, source: BattlePokemon, target: BattlePokemon}} EffectAddBasicArgs
 * @typedef {{battle: Battle, target: BattlePokemon}} EffectRemoveBasicArgs
 * @typedef {{battle: Battle, source: BattlePokemon, target: BattlePokemon}} AbilityAddBasicArgs
 * @typedef {{battle: Battle, source: BattlePokemon, target: BattlePokemon}} HeldItemAddBasicArgs
 * @typedef {typeof import("./data/effects").effectsToRegister} RegisteredEffects
 * @typedef {typeof import("./data/abilities").abilitiesToRegister} RegisteredAbilities
 * @typedef {import("./data/moves").Move} Move
 * @typedef {import("./data/moves").MoveTag} MoveTag
 * @typedef {import("./data/heldItems").HeldItemTag} HeldItemTag
 * @typedef {typeof import("./data/heldItems").heldItemsToRegister} RegisteredHeldItems
 * @typedef {import("./data/effects").EffectTag} EffectTag
 */

/**
 * @typedef {{
 *  pokemons: BattlePokemon[],
 *  rows: number,
 *  cols: number,
 * }} BattleParty
 */

/**
 * @typedef {{
 *  name: string,
 *  isNpc: boolean,
 *  userIds: string[],
 *  emoji: string,
 * }} BattleTeam
 */

/**
 * @typedef {{
 *  teamName: string,
 *  username: string,
 *  discriminator: string,
 *  id: string,
 *  npc?: BattleNPC,
 *  nextPhase?: (Battle) => any
 * }} BattleUser
 */

/**
 * @template T
 * @template U
 * @typedef {import("./data/effects").Effect<T, U>} Effect
 */

/**
 * @template T
 * @typedef {T extends Effect<infer U, infer V> ? U : never} EffectInitialArgsType
 */

/**
 * @template T
 * @typedef {T extends Effect<infer U, infer V> ? V & {} : never} EffectPropertiesType
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
 * @template T
 * @typedef {import("./data/abilities").Ability<T>} Ability
 */

/**
 * @template T
 * @typedef {T extends Ability<infer U> ? U : never} AbilityPropertiesType
 */

/**
 * @template {AbilityIdEnum} K
 * @typedef {K extends keyof RegisteredAbilities ? AbilityPropertiesType<RegisteredAbilities[K]> : any} AbilityPropertiesTypeFromId
 */

/**
 * @template {HeldItemIdEnum} T
 * @typedef {import("./data/heldItems").HeldItem<T>} HeldItem
 */

/**
 * @template T
 * @typedef {T extends HeldItem<infer U> ? U : never} HeldItemPropertiesType
 */

/**
 * @template {HeldItemIdEnum} K
 * @typedef {K extends keyof RegisteredHeldItems ? HeldItemPropertiesType<RegisteredHeldItems[K]> : any} HeldItemPropertiesTypeFromId
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
 * @param {BattlePokemon} param0.source
 * @param {number} param0.duration
 * @param {T} param0.initialArgs
 * @param {U} param0.properties
 */

/**
 * @callback MoveExecute
 * @this {MoveInstance & { id: MoveIdEnum }}
 */

/**
 * @template T
 * @callback AbilityAddCallback
 * @this {Ability<any>}
 * @param {AbilityAddBasicArgs} param0
 * @returns {T}
 */

/**
 * @template T
 * @callback AbilityRemoveCallback
 * @this {Ability<T>}
 * @param {object} param0
 * @param {Battle} param0.battle
 * @param {BattlePokemon} param0.source
 * @param {BattlePokemon} param0.target
 * @param {T} param0.properties
 */

/**
 * @template T
 * @callback HeldItemAddCallback
 * @this {HeldItem<any>}
 * @param {HeldItemAddBasicArgs} param0
 * @returns {T}
 */

/**
 * @template T
 * @callback HeldItemRemoveCallback
 * @this {HeldItem<T>}
 * @param {object} param0
 * @param {Battle} param0.battle
 * @param {BattlePokemon} param0.source
 * @param {BattlePokemon} param0.target
 * @param {T} param0.properties
 */

/**
 * @template T
 * @callback HeldItemUseCallback
 * @this {HeldItem<T>}
 * @param {object} param0
 * @param {Battle} param0.battle
 * @param {BattlePokemon} param0.source
 * @param {BattlePokemon} param0.target
 * @param {T} param0.properties
 */

/**
 * @template {BattleEventEnum} K
 * @callback BattleEventListenerCallback
 * @param {BattleEventArgs<K>} args
 * @returns {Partial<BattleEventArgs<K>> | void}
 */

/**
 * @template {BattleEventEnum} K
 * @callback BattleEventListenerConditionCallback
 * @param {BattleEventArgs<K>} args
 * @returns {boolean}
 */

// TODO: this typing might be too fluid
/**
 * @typedef {{
 *  source?: BattlePokemon | Pokemon | undefined,
 *  primaryTarget?: BattlePokemon | undefined,
 *  battle?: Battle | undefined,
 * }} FieldOverrideOptions
 * @callback FieldOverrideCallback
 * @param {FieldOverrideOptions} options
 * @returns {Partial<Move>}
 */
