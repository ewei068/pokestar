const { getMove } = require("../data/moveRegistry");
const {
  targetTypes,
  targetPositions,
  targetPatterns,
  damageTypes,
  moveTiers,
} = require("../../config/battleConfig");
const { types: pokemonTypes } = require("../../config/pokemonConfig");
const { abilityIdEnum } = require("../../enums/battleEnums");
const { logger } = require("../../log");

/**
 * @typedef {MoveIdEnum | "NO_ID"} MoveInstanceId
 */

/**
 * Represents an instance of a move being used in battle
 */
class MoveInstance {
  /**
   * @param {object} param0
   * @param {Move['getEffectiveValue']=} param0.getEffectiveValue
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
   * @param {MoveExecute=} param0.execute
   * @param {EffectIdEnum=} param0.chargeMoveEffectId
   * @param {MoveTag[]=} param0.tags
   * @param {BattlePokemon[]=} param0.allTargets
   * @param {BattlePokemon[]=} param0.missedTargets
   * @param {object=} param0.extraOptions
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
    execute = () => {
      this.genericDealAllDamage();
    },
    chargeMoveEffectId = null,
    tags = [],
    getEffectiveValue,
    // variables that may not be known when initialized
    allTargets = [],
    missedTargets = [],
    extraOptions = {},
  }) {
    this._source = source;
    this._battle = source.battle;
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
    this._extraOptions = extraOptions;
    this._getEffectiveValue = getEffectiveValue;
  }

  /**
   * Creates a new MoveInstance from a move ID
   * @param {object} args
   * @param {BattlePokemon} args.source
   * @param {BattlePokemon} args.primaryTarget
   * @param {MoveIdEnum} args.moveId
   * @param {object=} args.extraOptions
   * @param {BattlePokemon[]=} args.allTargets
   * @param {BattlePokemon[]=} args.missedTargets
   * @returns {MoveInstance}
   */
  static fromMoveId(args) {
    const move = getMove(args.moveId);
    if (!move) {
      throw new Error(`Move with ID ${args.moveId} not found`);
    }

    return new MoveInstance({
      id: args.moveId,
      ...args,
      ...move,
    });
  }

  /**
   * @template {keyof Move} K
   * @param {K} field
   * @param {Move[K]} defaultValue
   * @returns {Move[K]}
   */
  getEffectiveValue(field, defaultValue) {
    // @ts-ignore
    return (
      this._getEffectiveValue?.(field, {
        source: this.source,
        primaryTarget: this.primaryTarget,
        battle: this.battle,
      }) ?? defaultValue
    );
  }

  get source() {
    return this._source;
  }

  get primaryTarget() {
    return this._target;
  }

  get battle() {
    return this._battle;
  }

  /**
   * @returns {MoveInstanceId}
   */
  get id() {
    // @ts-ignore
    return this.getEffectiveValue("id", this._id);
  }

  set id(value) {
    this._id = value;
  }

  get name() {
    return this.getEffectiveValue("name", this._name);
  }

  set name(value) {
    this._name = value;
  }

  get type() {
    return this.getEffectiveValue("type", this._type);
  }

  set type(value) {
    this._type = value;
  }

  get power() {
    return this.getEffectiveValue("power", this._power);
  }

  set power(value) {
    this._power = value;
  }

  get accuracy() {
    return this.getEffectiveValue("accuracy", this._accuracy);
  }

  set accuracy(value) {
    this._accuracy = value;
  }

  get cooldown() {
    return this.getEffectiveValue("cooldown", this._cooldown);
  }

  set cooldown(value) {
    this._cooldown = value;
  }

  get targetType() {
    return this.getEffectiveValue("targetType", this._targetType);
  }

  set targetType(value) {
    this._targetType = value;
  }

  get targetPosition() {
    return this.getEffectiveValue("targetPosition", this._targetPosition);
  }

  set targetPosition(value) {
    this._targetPosition = value;
  }

  get targetPattern() {
    return this.getEffectiveValue("targetPattern", this._targetPattern);
  }

  set targetPattern(value) {
    this._targetPattern = value;
  }

  get tier() {
    return this.getEffectiveValue("tier", this._tier);
  }

  set tier(value) {
    this._tier = value;
  }

  get damageType() {
    return this.getEffectiveValue("damageType", this._damageType);
  }

  set damageType(value) {
    this._damageType = value;
  }

  // TODO fix this but this should only be used by `BattlePokemon.executeMoveInstance` so maybe it's fine
  execute(...args) {
    // @ts-ignore
    return this._execute(...args);
  }

  set setExecute(value) {
    this._execute = value;
  }

  get isLegacyMove() {
    if (this.id === "NO_ID") {
      return false;
    }
    return getMove(this.id)?.isLegacyMove;
  }

  get chargeMoveEffectId() {
    return this.getEffectiveValue(
      "chargeMoveEffectId",
      this._chargeMoveEffectId
    );
  }

  set chargeMoveEffectId(value) {
    this._chargeMoveEffectId = value;
  }

  get tags() {
    return this.getEffectiveValue("tags", this._tags);
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

  get extraOptions() {
    return this._extraOptions;
  }

  set extraOptions(value) {
    this._extraOptions = value;
  }

  genericDealSingleDamage({
    source = this.source,
    target,
    primaryTarget = this.primaryTarget,
    allTargets = this.allTargets,
    missedTargets = this.missedTargets,
    offTargetDamageMultiplier,
    backTargetDamageMultiplier,
    calculateDamageFunction = undefined,
    attackOverride = null,
  }) {
    const damageFunc =
      calculateDamageFunction || ((args) => source.calculateMoveDamage(args));
    const damageToDeal = damageFunc({
      move: this,
      target,
      primaryTarget,
      allTargets,
      missedTargets,
      offTargetDamageMultiplier,
      backTargetDamageMultiplier,
      attackOverride,
    });
    return source.dealDamage(damageToDeal, target, {
      type: "move",
      id: this.id,
      moveId: this.id, // for backward compat
      instance: this,
    });
  }

  /**
   * @typedef {{
   *  damageInstances: Record<string, number>,
   *  totalDamageDealt: number,
   * }} GenericDealAllDamageResult
   */

  /**
   * @param {object} param0
   * @param {BattlePokemon=} param0.source
   * @param {BattlePokemon=} param0.primaryTarget
   * @param {Array<BattlePokemon>=} param0.allTargets
   * @param {Array<BattlePokemon>=} param0.missedTargets
   * @param {number=} param0.offTargetDamageMultiplier
   * @param {number=} param0.backTargetDamageMultiplier
   * @param {Function=} param0.calculateDamageFunction
   * @param {number=} param0.attackOverride
   * @returns {GenericDealAllDamageResult}
   */
  genericDealAllDamage({
    source = this.source,
    primaryTarget = this.primaryTarget,
    allTargets = this.allTargets,
    missedTargets = this.missedTargets,
    offTargetDamageMultiplier,
    backTargetDamageMultiplier,
    calculateDamageFunction = undefined,
    attackOverride = null,
  } = {}) {
    const /** @type {Record<string, number>} */ damageInstances = {};
    for (const target of allTargets) {
      const damageToTarget = this.genericDealSingleDamage({
        source,
        target,
        primaryTarget,
        allTargets,
        missedTargets,
        offTargetDamageMultiplier,
        backTargetDamageMultiplier,
        calculateDamageFunction,
        attackOverride,
      });
      damageInstances[target.id] = damageToTarget;
    }
    return {
      damageInstances,
      totalDamageDealt: Object.values(damageInstances).reduce(
        (sum, damage) => sum + damage,
        0
      ),
    };
  }

  /**
   * @template {any} T
   * @template {any} U
   * @param {object} param0
   * @param {BattlePokemon=} param0.source
   * @param {number=} param0.probability
   * @param {() => T} param0.onShouldTrigger
   * @param {() => U=} param0.onShouldNotTrigger
   * @returns {{
   *  triggered: boolean,
   *  onShouldTriggerResult?: T,
   *  onShouldNotTriggerResult?: U,
   * }}
   */
  triggerSecondaryEffect({
    source = this.source,
    onShouldTrigger,
    onShouldNotTrigger = () => undefined,
    probability = 1,
  }) {
    let shouldTrigger = false;
    const roll = Math.random();
    if (roll < probability) {
      shouldTrigger = true;
    } else if (
      source.hasActiveAbility(abilityIdEnum.SERENE_GRACE) &&
      roll < 2 * probability
    ) {
      source.battle.addToLog(`${source.name}'s Serene Grace activates!`);
      shouldTrigger = true;
    }

    if (shouldTrigger) {
      return {
        triggered: true,
        onShouldTriggerResult: onShouldTrigger(),
      };
    }
    return {
      triggered: false,
      onShouldNotTriggerResult: onShouldNotTrigger(),
    };
  }

  /**
   * @param {Parameters<typeof this.triggerSecondaryEffect>[0] & {
   *  target: BattlePokemon,
   *  missedTargets?: BattlePokemon[],
   * }} args
   */
  triggerSecondaryEffectOnTarget(args) {
    const { target, missedTargets = this.missedTargets } = args;
    if (!missedTargets.includes(target)) {
      return this.triggerSecondaryEffect(args);
    }
  }

  genericApplySingleStatus({
    source = this.source,
    target,
    // eslint-disable-next-line no-unused-vars
    primaryTarget = this.primaryTarget,
    // eslint-disable-next-line no-unused-vars
    allTargets = this.allTargets,
    missedTargets = this.missedTargets,
    statusId,
    options,
    probability = 1,
  }) {
    const { triggered, onShouldTriggerResult } =
      this.triggerSecondaryEffectOnTarget({
        source,
        target,
        missedTargets,
        probability,
        onShouldTrigger: () => target.applyStatus(statusId, source, options),
      }) || {};
    if (triggered) {
      return onShouldTriggerResult;
    }
    return false;
  }

  /**
   * @param {object} param0
   * @param {BattlePokemon=} param0.source
   * @param {BattlePokemon=} param0.primaryTarget
   * @param {Array<BattlePokemon>=} param0.allTargets
   * @param {Array<BattlePokemon>=} param0.missedTargets
   * @param {StatusConditionEnum} param0.statusId
   * @param {object=} param0.options
   * @param {number=} param0.probability
   */
  genericApplyAllStatus({
    source = this.source,
    primaryTarget = this.primaryTarget,
    allTargets = this.allTargets,
    missedTargets = this.missedTargets,
    statusId,
    options,
    probability = 1,
  }) {
    for (const target of allTargets) {
      this.genericApplySingleStatus({
        source,
        target,
        primaryTarget,
        allTargets,
        missedTargets,
        statusId,
        options,
        probability,
      });
    }
  }

  /**
   * @template {EffectIdEnum} K
   * @param {object} param0
   * @param {BattlePokemon=} param0.source
   * @param {BattlePokemon=} param0.target
   * @param {BattlePokemon=} param0.primaryTarget
   * @param {BattlePokemon[]=} param0.allTargets
   * @param {BattlePokemon[]=} param0.missedTargets
   * @param {K} param0.effectId
   * @param {number} param0.duration
   * @param {EffectInitialArgsTypeFromId<K>=} param0.initialArgs
   * @param {number=} param0.probability
   */
  genericApplySingleEffect({
    source = this.source,
    target,
    // eslint-disable-next-line no-unused-vars
    primaryTarget = this.primaryTarget,
    // eslint-disable-next-line no-unused-vars
    allTargets = this.allTargets,
    missedTargets = this.missedTargets,
    effectId,
    duration,
    // @ts-ignore
    initialArgs = {},
    probability = 1,
  }) {
    const { triggered, onShouldTriggerResult } =
      this.triggerSecondaryEffectOnTarget({
        source,
        target,
        missedTargets,
        probability,
        onShouldTrigger: () =>
          target.applyEffect(effectId, duration, source, initialArgs),
      }) || {};
    if (triggered) {
      return onShouldTriggerResult;
    }
    return false;
  }

  /**
   * @template {EffectIdEnum} K
   * @param {object} param0
   * @param {BattlePokemon=} param0.source
   * @param {BattlePokemon=} param0.primaryTarget
   * @param {Array<BattlePokemon>=} param0.allTargets
   * @param {Array<BattlePokemon>=} param0.missedTargets
   * @param {K} param0.effectId
   * @param {number} param0.duration
   * @param {EffectInitialArgsTypeFromId<K>=} param0.initialArgs
   * @param {number=} param0.probability
   */
  genericApplyAllEffects({
    source = this.source,
    primaryTarget = this.primaryTarget,
    allTargets = this.allTargets,
    missedTargets = this.missedTargets,
    effectId,
    duration,
    // @ts-ignore
    initialArgs = {},
    probability = 1,
  }) {
    for (const target of allTargets) {
      this.genericApplySingleEffect({
        source,
        target,
        primaryTarget,
        allTargets,
        missedTargets,
        effectId,
        duration,
        initialArgs,
        probability,
      });
    }
  }

  genericChangeSingleCombatReadiness({
    source = this.source,
    target,
    // eslint-disable-next-line no-unused-vars
    primaryTarget = this.primaryTarget,
    // eslint-disable-next-line no-unused-vars
    allTargets = this.allTargets,
    missedTargets = this.missedTargets,
    amount,
    action,
    probability = 1,
    triggerEvents = true,
  }) {
    const shouldChangeCombatReadiness =
      !missedTargets.includes(target) && Math.random() < probability;

    if (shouldChangeCombatReadiness) {
      if (action === "boost") {
        return target.boostCombatReadiness(source, amount, triggerEvents);
      }
      if (action === "reduce") {
        return target.reduceCombatReadiness(source, amount);
      }
    }
    return 0;
  }

  /**
   * @param {object} param0
   * @param {BattlePokemon=} param0.source
   * @param {BattlePokemon=} param0.primaryTarget
   * @param {Array<BattlePokemon>=} param0.allTargets
   * @param {Array<BattlePokemon>=} param0.missedTargets
   * @param {number} param0.amount
   * @param {"boost" | "reduce"} param0.action
   * @param {number=} param0.probability
   * @param {boolean=} param0.triggerEvents
   */
  genericChangeAllCombatReadiness({
    source = this.source,
    primaryTarget = this.primaryTarget,
    allTargets = this.allTargets,
    missedTargets = this.missedTargets,
    amount,
    action,
    probability = 1,
    triggerEvents = true,
  }) {
    for (const target of allTargets) {
      this.genericChangeSingleCombatReadiness({
        source,
        target,
        primaryTarget,
        allTargets,
        missedTargets,
        amount,
        action,
        probability,
        triggerEvents,
      });
    }
  }

  /**
   * Heals a single target for a specific amount or percentage of max HP
   * @param {object} param0
   * @param {BattlePokemon=} param0.source
   * @param {BattlePokemon} param0.target
   * @param {number=} param0.healAmount - Direct amount to heal
   * @param {number=} param0.healPercent - Percentage of max HP to heal (0-100)
   * @returns {number} - Amount healed
   */
  genericHealSingleTarget({
    source = this.source,
    target,
    healAmount = undefined,
    healPercent = undefined,
  }) {
    if (healAmount === undefined && healPercent === undefined) {
      logger.warn(
        `genericHealSingleTarget called with no healAmount or healPercent for move ${this.id}`
      );
      return 0;
    }

    const amountToHeal =
      healAmount !== undefined
        ? healAmount
        : Math.max(1, Math.floor((target.maxHp * healPercent) / 100));
    return source.giveHeal(amountToHeal, target, {
      type: "move",
      moveId: this.id,
    });
  }

  /**
   * Heals all targets for a specific amount or percentage of max HP
   * @param {object} param0
   * @param {BattlePokemon=} param0.source
   * @param {Array<BattlePokemon>=} param0.allTargets
   * @param {number=} param0.healAmount - Direct amount to heal
   * @param {number=} param0.healPercent - Percentage of max HP to heal (0-100)
   * @returns {number} - Total amount healed
   */
  genericHealAllTargets({
    source = this.source,
    allTargets = this.allTargets,
    healAmount = undefined,
    healPercent = undefined,
  }) {
    let totalHealed = 0;
    for (const target of allTargets) {
      totalHealed += this.genericHealSingleTarget({
        source,
        target,
        healAmount,
        healPercent,
      });
    }
    return totalHealed;
  }
}

module.exports = {
  MoveInstance,
};
