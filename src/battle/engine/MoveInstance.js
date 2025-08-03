const { getMove } = require("../data/moveRegistry");
const {
  targetTypes,
  targetPositions,
  targetPatterns,
  damageTypes,
  moveTiers,
  statusConditions,
  effectTypes,
  weatherConditions,
} = require("../../config/battleConfig");
const { types: pokemonTypes } = require("../../config/pokemonConfig");

/**
 * @typedef {MoveIdEnum | "NO_ID"} MoveInstanceId
 */

/**
 * Represents an instance of a move being used in battle
 */
class MoveInstance {
  /**
   * @param {object} param0
   * @param {BattlePokemon} param0.source
   * @param {BattlePokemon} param0.primaryTarget
   * @param {MoveInstanceId=} param0.id
   * @param {string=} param0.name
   * @param {PokemonTypeEnum=} param0.type
   * @param {number=} param0.power
   * @param {number=} param0.accuracy
   * @param {number=} param0.cooldown
   * @param {TargetTypeEnum=} param0.targetType
   * @param {TargetPositionEnum=} param0.targetPosition
   * @param {TargetPatternEnum=} param0.targetPattern
   * @param {MoveTierEnum=} param0.tier
   * @param {DamageTypeEnum=} param0.damageType
   * @param {Function=} param0.execute
   * @param {EffectIdEnum=} param0.chargeMoveEffectId
   * @param {MoveTag[]=} param0.tags
   * @param {BattlePokemon[]=} param0.allTargets
   * @param {BattlePokemon[]=} param0.missedTargets
   */
  constructor({
    source,
    primaryTarget,
    id = "NO_ID", // IDK how to make this static LOL
    name = "No Name",
    type = pokemonTypes.NORMAL,
    power = 40,
    accuracy = 100,
    cooldown = 0,
    targetType = targetTypes.ANY,
    targetPosition = targetPositions.FRONT,
    targetPattern = targetPatterns.SINGLE,
    tier = moveTiers.BASIC,
    damageType = damageTypes.PHYSICAL,
    execute = () => {},
    chargeMoveEffectId = null,
    tags = [],

    // variables that probably aren't known when initialized
    allTargets = [],
    missedTargets = [],
  }) {
    this._source = source;
    this._target = primaryTarget;
    this._id = id;
    this._name = name;
    this._type = type;
    this._power = power;
    this._accuracy = accuracy;
    this._cooldown = cooldown;
    this._targetType = targetType;
    this._targetPosition = targetPosition;
    this._targetPattern = targetPattern;
    this._tier = tier;
    this._damageType = damageType;
    this._execute = execute;
    this._chargeMoveEffectId = chargeMoveEffectId;
    this._tags = tags;
    this._allTargets = allTargets;
    this._missedTargets = missedTargets;
  }

  /**
   * Creates a new MoveInstance from a move ID
   * @param {BattlePokemon} source
   * @param {BattlePokemon} primaryTarget
   * @param {MoveIdEnum} moveId
   * @returns {MoveInstance}
   */
  static fromMoveId(source, primaryTarget, moveId) {
    const move = getMove(moveId);
    if (!move) {
      throw new Error(`Move with ID ${moveId} not found`);
    }

    return new MoveInstance({
      source,
      primaryTarget,
      id: move.id,
      name: move.name,
      type: move.type,
      power: move.power,
      accuracy: move.accuracy,
      cooldown: move.cooldown,
      targetType: move.targetType,
      targetPosition: move.targetPosition,
      targetPattern: move.targetPattern,
      tier: move.tier,
      damageType: move.damageType,
      execute: move.execute,
      chargeMoveEffectId: move.chargeMoveEffectId,
      tags: move.tags,
    });
  }

  get source() {
    return this._source;
  }

  get primaryTarget() {
    return this._target;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = value;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }

  get power() {
    return this._power;
  }

  set power(value) {
    this._power = value;
  }

  get accuracy() {
    return this._accuracy;
  }

  set accuracy(value) {
    this._accuracy = value;
  }

  get cooldown() {
    return this._cooldown;
  }

  set cooldown(value) {
    this._cooldown = value;
  }

  get targetType() {
    return this._targetType;
  }

  set targetType(value) {
    this._targetType = value;
  }

  get targetPosition() {
    return this._targetPosition;
  }

  set targetPosition(value) {
    this._targetPosition = value;
  }

  get targetPattern() {
    return this._targetPattern;
  }

  set targetPattern(value) {
    this._targetPattern = value;
  }

  get tier() {
    return this._tier;
  }

  set tier(value) {
    this._tier = value;
  }

  get damageType() {
    return this._damageType;
  }

  set damageType(value) {
    this._damageType = value;
  }

  execute(args) {
    return this._execute(args);
  }

  set setExecute(value) {
    this._execute = value;
  }

  get chargeMoveEffectId() {
    return this._chargeMoveEffectId;
  }

  set chargeMoveEffectId(value) {
    this._chargeMoveEffectId = value;
  }

  get tags() {
    return this._tags;
  }

  set tags(value) {
    this._tags = value;
  }

  get allTargets() {
    return this._allTargets;
  }

  set allTargets(value) {
    this._allTargets = value;
  }

  get missedTargets() {
    return this._missedTargets;
  }

  set missedTargets(value) {
    this._missedTargets = value;
  }
}

module.exports = {
  MoveInstance,
};
