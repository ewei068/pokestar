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
});

/**
 * @typedef {import("../config/battleConfig").LegacyMoveIdEnum} LegacyMoveIdEnum
 * @typedef {Enum<moveIdEnum>} NewMoveIdEnum
 * @typedef {LegacyMoveIdEnum | NewMoveIdEnum} MoveIdEnum
 */
const moveIdEnum = Object.freeze({
  TEST_MOVE: "999",
  TEST_MOVE2: "998",
  VINE_WHIP: "m22",
  AQUA_IMPACT: "m618-1",
});

/**
 * @typedef {import("../config/battleConfig").LegacyAbilityIdEnum} LegacyAbilityIdEnum
 * @typedef {Enum<abilityIdEnum>} NewAbilityIdEnum
 * @typedef {LegacyAbilityIdEnum | NewAbilityIdEnum} AbilityIdEnum
 */
const abilityIdEnum = Object.freeze({
  TEST_ABILITY: "testAbility",
  REGENERATOR: "144",
  AQUA_POWER: "2-1",
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
});

/**
 * @template {BattleEventEnum} K
 * @typedef {{
 *  [battleEventEnum.BATTLE_BEGIN]: {},
 *  [battleEventEnum.TURN_END]: {activePokemon: BattlePokemon},
 *  [battleEventEnum.TURN_BEGIN]: {},
 *  [battleEventEnum.BEFORE_MOVE]: {canUseMove: boolean, source: BattlePokemon, primaryTarget: BattlePokemon, moveId: MoveIdEnum},
 *  [battleEventEnum.BEFORE_MOVE_EXECUTE]: any,
 *  [battleEventEnum.AFTER_MOVE]: any,
 *  [battleEventEnum.BEFORE_DAMAGE_DEALT]: any,
 *  [battleEventEnum.AFTER_DAMAGE_DEALT]: any,
 *  [battleEventEnum.BEFORE_DAMAGE_TAKEN]: any,
 *  [battleEventEnum.AFTER_DAMAGE_TAKEN]: any,
 *  [battleEventEnum.BEFORE_CR_GAINED]: any,
 *  [battleEventEnum.AFTER_CR_GAINED]: any,
 *  [battleEventEnum.BEFORE_EFFECT_ADD]: { target: BattlePokemon, source: BattlePokemon, effectId: EffectIdEnum, duration: number, initialArgs: any, canAdd: boolean },
 *  [battleEventEnum.AFTER_EFFECT_ADD]: any,
 *  [battleEventEnum.BEFORE_EFFECT_REMOVE]: any,
 *  [battleEventEnum.AFTER_EFFECT_REMOVE]: any,
 *  [battleEventEnum.BEFORE_STATUS_APPLY]: any,
 *  [battleEventEnum.AFTER_STATUS_APPLY]: any,
 *  [battleEventEnum.BEFORE_CAUSE_FAINT]: any,
 *  [battleEventEnum.BEFORE_FAINT]: any,
 *  [battleEventEnum.AFTER_FAINT]: any,
 *  [battleEventEnum.CALCULATE_TYPE_MULTIPLIER]: any,
 *  [battleEventEnum.CALCULATE_MISS]: any,
 *  [battleEventEnum.GET_ELIGIBLE_TARGETS]: any,
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
  battleEventEnum,
};
