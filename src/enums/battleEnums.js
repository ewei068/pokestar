/**
 * @typedef {import("../config/battleConfig").LegacyEffectIdEnum} LegacyEffectIdEnum
 * @typedef {Enum<effectIdEnum>} NewEffectIdEnum
 * @typedef {LegacyEffectIdEnum | NewEffectIdEnum} EffectIdEnum
 */
const effectIdEnum = Object.freeze({
  TEST_EFFECT: "testEffect",
  ATK_UP: "atkUp",
  SHIELD: "shield",
  DEBUFF_IMMUNITY: "debuffImmunity",
  AQUA_BLESSING: "aquaBlessing",
  DOOM_DESIRE: "doomDesire",
});

/**
 * @typedef {import("../config/battleConfig").LegacyMoveIdEnum} LegacyMoveIdEnum
 * @typedef {Enum<moveIdEnum>} NewMoveIdEnum
 * @typedef {LegacyMoveIdEnum | NewMoveIdEnum} MoveIdEnum
 */
const moveIdEnum = Object.freeze({
  TEST_MOVE: "999",
  TEST_MOVE2: "998",
  FIRE_PUNCH: "m7",
  ICE_PUNCH: "m8",
  VINE_WHIP: "m22",
  CONFUSION: "m93",
  PSYCHIC: "m94",
  BRICK_BREAK: "m280",
  DOOM_DESIRE: "m353",
  IRON_HEAD: "m442",
  WOOD_HAMMER: "m452",
  QUASH: "m511",
  ICICLE_CRASH: "m556",
  AQUA_IMPACT: "m618-1",
  MAGMA_IMPACT: "m619-1",
  FLAME_BALL: "m780-1",
});

/**
 * @typedef {import("../config/battleConfig").LegacyAbilityIdEnum} LegacyAbilityIdEnum
 * @typedef {Enum<abilityIdEnum>} NewAbilityIdEnum
 * @typedef {LegacyAbilityIdEnum | NewAbilityIdEnum} AbilityIdEnum
 */
const abilityIdEnum = Object.freeze({
  TEST_ABILITY: "testAbility",
  AQUA_POWER: "2-1",
  SERENE_GRACE: "32",
  FLAME_BODY: "49",
  MAGMA_POWER: "70-1",
  ANGER_POINT: "83",
  DOWNLOAD: "88",
  IRON_FIST: "89",
  REGENERATOR: "144",
  BURNING_DRAFT: "20018",
  JET_SPEED: "20019",
  ALPHA_CORE: "20020",
  OMEGA_CORE: "20021",
});

/** @typedef {Enum<heldItemIdEnum>} HeldItemIdEnum */
const heldItemIdEnum = Object.freeze({
  LUM_BERRY: "h134",
  SITRUS_BERRY: "h135",
  EXP_SHARE: "h193",
  CHOICE_BAND: "h197",
  AMULET_COIN: "h200",
  FOCUS_BAND: "h207",
  LUCKY_EGG: "h208",
  LEFTOVERS: "h211",
  WIDE_LENS: "h242",
  LIFE_ORB: "h247",
  POWER_HERB: "h248",
  FOCUS_SASH: "h252",
  CHOICE_SCARF: "h264",
  CHOICE_SPECS: "h274",
  EVIOLITE: "h581",
  HEAVY_DUTY_BOOTS: "h1178",
});

/** @typedef {Enum<battleEventEnum>} BattleEventEnum */
const battleEventEnum = Object.freeze({
  BATTLE_BEGIN: "battleStart",
  TURN_END: "turnEnd",
  TURN_BEGIN: "turnBegin",
  BEFORE_MOVE: "beforeMove",
  BEFORE_MOVE_EXECUTE: "beforeMoveExecute",
  AFTER_MOVE: "afterMove",
  BEFORE_DAMAGE_DEALT: "beforeDamageDealt",
  AFTER_DAMAGE_DEALT: "afterDamageDealt",
  BEFORE_DAMAGE_TAKEN: "beforeDamageTaken",
  AFTER_DAMAGE_TAKEN: "afterDamageTaken",
  BEFORE_CR_GAINED: "beforeCRGained",
  AFTER_CR_GAINED: "afterCRGained",
  BEFORE_EFFECT_ADD: "beforeEffectAdd",
  AFTER_EFFECT_ADD: "afterEffectAdd",
  BEFORE_EFFECT_REMOVE: "beforeEffectRemove",
  AFTER_EFFECT_REMOVE: "afterEffectRemove",
  BEFORE_STATUS_APPLY: "beforeStatusApply",
  AFTER_STATUS_APPLY: "afterStatusApply",
  BEFORE_CAUSE_FAINT: "beforeCauseFaint",
  BEFORE_FAINT: "beforeFaint",
  AFTER_FAINT: "afterFaint",
  CALCULATE_TYPE_MULTIPLIER: "calculateTypeMultiplier",
  CALCULATE_MISS: "calculateMiss",
  GET_ELIGIBLE_TARGETS: "getEligibleTargets",
  AFTER_WEATHER_SET: "afterWeatherSet",
  AFTER_TRANSFORM: "afterTransform",
});

/**
 * @template {BattleEventEnum} K
 * @typedef {{
 *  [battleEventEnum.BATTLE_BEGIN]: {},
 *  [battleEventEnum.TURN_END]: { activePokemon: BattlePokemon },
 *  [battleEventEnum.TURN_BEGIN]: {},
 *  [battleEventEnum.BEFORE_MOVE]: { canUseMove: boolean, source: BattlePokemon, primaryTarget: BattlePokemon, moveId: MoveIdEnum} ,
 *  [battleEventEnum.BEFORE_MOVE_EXECUTE]: { source: BattlePokemon, primaryTarget: BattlePokemon, allTargets: BattlePokemon[], missedTargets: BattlePokemon[], moveId: MoveIdEnum },
 *  [battleEventEnum.AFTER_MOVE]: { source: BattlePokemon, primaryTarget: BattlePokemon, allTargets: BattlePokemon[], missedTargets: BattlePokemon[], moveId: MoveIdEnum },
 *  [battleEventEnum.BEFORE_DAMAGE_DEALT]: { target: BattlePokemon, source: BattlePokemon, damage: number, damageInfo: any },
 *  [battleEventEnum.AFTER_DAMAGE_DEALT]: any,
 *  [battleEventEnum.BEFORE_DAMAGE_TAKEN]: { target: BattlePokemon, source: BattlePokemon, damage: number, maxDamage: number, damageInfo: any },
 *  [battleEventEnum.AFTER_DAMAGE_TAKEN]: { target: BattlePokemon, source: BattlePokemon, damage: number, damageInfo: any },
 *  [battleEventEnum.BEFORE_CR_GAINED]: any,
 *  [battleEventEnum.AFTER_CR_GAINED]: any,
 *  [battleEventEnum.BEFORE_EFFECT_ADD]: { target: BattlePokemon, source: BattlePokemon, effectId: EffectIdEnum, duration: number, initialArgs: any, canAdd: boolean },
 *  [battleEventEnum.AFTER_EFFECT_ADD]: any,
 *  [battleEventEnum.BEFORE_EFFECT_REMOVE]: any,
 *  [battleEventEnum.AFTER_EFFECT_REMOVE]: any,
 *  [battleEventEnum.BEFORE_STATUS_APPLY]: any,
 *  [battleEventEnum.AFTER_STATUS_APPLY]: { target: BattlePokemon, source: BattlePokemon, statusId: StatusConditionEnum },
 *  [battleEventEnum.BEFORE_CAUSE_FAINT]: any,
 *  [battleEventEnum.BEFORE_FAINT]: any,
 *  [battleEventEnum.AFTER_FAINT]: any,
 *  [battleEventEnum.CALCULATE_TYPE_MULTIPLIER]: any,
 *  [battleEventEnum.CALCULATE_MISS]: any,
 *  [battleEventEnum.GET_ELIGIBLE_TARGETS]: any,
 *  [battleEventEnum.AFTER_WEATHER_SET]: any,
 *  [battleEventEnum.AFTER_TRANSFORM]: { target: BattlePokemon, beforeSpeciesId: PokemonIdEnum, afterSpeciesId: PokemonIdEnum },
 * }[K]} BattleEventArgsWithoutEventName
 */

/**
 * @template {BattleEventEnum} K
 * @typedef {BattleEventArgsWithoutEventName<K> & { eventName: K }} BattleEventArgs
 */

module.exports = {
  moveIdEnum,
  effectIdEnum,
  abilityIdEnum,
  heldItemIdEnum,
  battleEventEnum,
};
