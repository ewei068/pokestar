const { types: pokemonTypes } = require("../../config/pokemonConfig");
const {
  targetTypes,
  targetPositions,
  targetPatterns,
  damageTypes,
  moveTiers,
} = require("../../config/battleConfig");
const { getMove } = require("./moveRegistry");
const { moveIdEnum } = require("../../enums/battleEnums");

class Move {
  /**
   * @param {object} param0
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

  genericDealSingleDamage({
    source,
    target,
    primaryTarget,
    allTargets,
    missedTargets = [],
    offTargetDamageMultiplier = 0.8,
  }) {
    const damageToDeal = source.calculateMoveDamage({
      move: getMove(this.id),
      target,
      primaryTarget,
      allTargets,
      missedTargets,
      offTargetDamageMultiplier,
    });
    return source.dealDamage(damageToDeal, target, {
      type: "move",
      moveId: this.id,
    });
  }

  /**
   * @param {object} param0
   * @param {BattlePokemon} param0.source
   * @param {BattlePokemon} param0.primaryTarget
   * @param {Array<BattlePokemon>} param0.allTargets
   * @param {Array<BattlePokemon>=} param0.missedTargets
   * @param {number=} param0.offTargetDamageMultiplier
   */
  genericDealAllDamage({
    source,
    primaryTarget,
    allTargets,
    missedTargets = [],
    offTargetDamageMultiplier = 0.8,
  }) {
    for (const target of allTargets) {
      this.genericDealSingleDamage({
        source,
        target,
        primaryTarget,
        allTargets,
        missedTargets,
        offTargetDamageMultiplier,
      });
    }
  }
}

const movesToRegister = Object.freeze({
  [moveIdEnum.VINE_WHIP]: new Move({
    id: moveIdEnum.VINE_WHIP,
    name: "Vine Whip",
    type: pokemonTypes.GRASS,
    power: 55,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is struck with slender, whiplike vines to inflict damage.",
    execute({ source, primaryTarget, allTargets, missedTargets }) {
      this.genericDealAllDamage({
        source,
        primaryTarget,
        allTargets,
        missedTargets,
      });
    },
  }),
});

module.exports = {
  Move,
  movesToRegister,
};
