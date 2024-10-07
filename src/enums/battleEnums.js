const types = require("../../types");

/**
 * @typedef {import("../config/battleConfig").LegacyEffectIdEnum} LegacyEffectIdEnum
 * @typedef {types.Enum<effectIdEnum>} NewEffectIdEnum
 * @typedef {LegacyEffectIdEnum | NewEffectIdEnum} EffectIdEnum
 */

const effectIdEnum = Object.freeze({
  TEST_EFFECT: "testEffect",
  ATK_UP: "atkUp",
  SHIELD: "shield",
});

/**
 * @typedef {import("../config/battleConfig").LegacyMoveIdEnum} LegacyMoveIdEnum
 * @typedef {types.Enum<moveIdEnum>} NewMoveIdEnum
 * @typedef {LegacyMoveIdEnum | NewMoveIdEnum} MoveIdEnum
 */

const moveIdEnum = Object.freeze({
  TEST_MOVE: "999",
  TEST_MOVE2: "998",
  VINE_WHIP: "m22",
});

/** @typedef {types.Enum<battleEventEnum>} BattleEventEnum */
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

module.exports = {
  moveIdEnum,
  effectIdEnum,
  battleEventEnum,
};
