/**
 * @typedef {import("../enums/battleEnums").MoveIdEnum} MoveIdEnum
 *
 * @typedef {import("../services/battle").Battle} Battle
 * @typedef {import("../services/battle").Pokemon} BattlePokemon
 *
 * @typedef {import("./battleConfig").BattleEventEnum} BattleEventEnum
 * @typedef {import("./battleConfig").DamageTypeEnum} DamageTypeEnum
 * @typedef {import("./battleConfig").MoveTierEnum} MoveTierEnum
 * @typedef {import("./battleConfig").StatusConditionEnum} StatusConditionEnum
 * @typedef {import("./battleConfig").TargetTypeEnum} TargetTypeEnum
 * @typedef {import("./battleConfig").TargetPositionEnum} TargetPositionEnum
 * @typedef {import("./battleConfig").TargetPatternEnum} TargetPatternEnum
 *
 * @typedef {import("./moves").Move} Move
 */

/**
 * @callback MoveExecute
 * @this {Move}
 * @param {Object} param0
 * @param {Battle} param0.battle
 * @param {BattlePokemon} param0.source
 * @param {BattlePokemon} param0.primaryTarget
 * @param {Array<BattlePokemon>} param0.allTargets
 * @param {Array<BattlePokemon>} param0.missedTargets
 */
