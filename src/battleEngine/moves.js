/**
 * @typedef {import("../config/pokemonConfig").PokemonTypeEnum} PokemonTypeEnum
 */

class Move {
  /**
   * @param {Object} param0
   * @param {MoveIdEnum} param0.id
   * @param {string} param0.name
   * @param {PokemonTypeEnum} param0.type
   * @param {number} param0.power
   * @param {number?} param0.accuracy
   * @param {number} param0.cooldown
   * @param {TargetTypeEnum} param0.targetType
   * @param {TargetPositionEnum} param0.targetPosition
   * @param {TargetPatternEnum} param0.targetPattern
   * @param {MoveTierEnum} param0.tier
   * @param {DamageTypeEnum} param0.damageType
   * @param {string} param0.description
   * @param {MoveExecute} param0.execute
   */
  constructor({
    id,
    name,
    type,
    power,
    accuracy,
    cooldown,
    targetType,
    targetPosition,
    targetPattern,
    tier,
    damageType,
    description,
    execute,
  }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.power = power;
    this.accuracy = accuracy;
    this.cooldown = cooldown;
    this.targetType = targetType;
    this.targetPosition = targetPosition;
    this.targetPattern = targetPattern;
    this.tier = tier;
    this.damageType = damageType;
    this.description = description;
    this.execute = execute;
    this.isLegacyMove = false;
  }
}

const movesToRegister = [];

module.exports = {
  Move,
  movesToRegister,
};
