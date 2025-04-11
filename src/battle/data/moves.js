const { types: pokemonTypes } = require("../../config/pokemonConfig");
const {
  targetTypes,
  targetPositions,
  targetPatterns,
  damageTypes,
  moveTiers,
  statusConditions,
  effectTypes,
} = require("../../config/battleConfig");
const { getMove } = require("./moveRegistry");
const { getHeldItem } = require("./heldItemRegistry");
const { getEffect } = require("./effectRegistry");
const { getHeldItemIdHasTag } = require("../../utils/battleUtils");
const {
  moveIdEnum,
  abilityIdEnum,
  effectIdEnum,
} = require("../../enums/battleEnums");
const { drawIterable } = require("../../utils/gachaUtils");

/** @typedef {"charge" | "punch"} MoveTag */

class Move {
  /**
   * @param {object} param0
   * @param {AllMoveIdEnum} param0.id
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
   * @param {EffectIdEnum=} param0.chargeMoveEffectId
   * @param {MoveTag[]=} param0.tags
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
    chargeMoveEffectId,
    tags = [],
  }) {
    /** @type {MoveIdEnum} */
    // @ts-ignore
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
    this.silenceIf = undefined; // TODO
    this.chargeMoveEffectId = chargeMoveEffectId;
    this.tags = tags;
  }

  genericDealSingleDamage({
    source,
    target,
    primaryTarget,
    allTargets,
    missedTargets = [],
    offTargetDamageMultiplier,
    backTargetDamageMultiplier,
    calculateDamageFunction = undefined,
  }) {
    const damageFunc =
      calculateDamageFunction || ((args) => source.calculateMoveDamage(args));
    const damageToDeal = damageFunc({
      move: getMove(this.id),
      target,
      primaryTarget,
      allTargets,
      missedTargets,
      offTargetDamageMultiplier,
      backTargetDamageMultiplier,
    });
    return source.dealDamage(damageToDeal, target, {
      type: "move",
      moveId: this.id,
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
   * @param {BattlePokemon} param0.source
   * @param {BattlePokemon} param0.primaryTarget
   * @param {Array<BattlePokemon>} param0.allTargets
   * @param {Array<BattlePokemon>=} param0.missedTargets
   * @param {number=} param0.offTargetDamageMultiplier
   * @param {number=} param0.backTargetDamageMultiplier
   * @param {CalculateMoveDamageImpl=} param0.calculateDamageFunction
   * @returns {GenericDealAllDamageResult}
   */
  genericDealAllDamage({
    source,
    primaryTarget,
    allTargets,
    missedTargets = [],
    offTargetDamageMultiplier,
    backTargetDamageMultiplier,
    calculateDamageFunction = undefined,
  }) {
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
   * @param {BattlePokemon} param0.source
   * @param {number=} param0.probability
   * @param {() => T} param0.onShouldTrigger
   * @param {() => U=} param0.onShouldNotTrigger
   * @returns {{
   *  triggered: boolean,
   *  onShouldTriggerResult?: T,
   *  onShouldNotTriggerResult?: U,
   * }}
   */
  // eslint-disable-next-line class-methods-use-this
  triggerSecondaryEffect({
    source,
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

  // eslint-disable-next-line class-methods-use-this
  genericApplySingleStatus({
    source,
    target,
    // eslint-disable-next-line no-unused-vars
    primaryTarget,
    // eslint-disable-next-line no-unused-vars
    allTargets,
    missedTargets = [],
    statusId,
    options,
    probability = 1,
  }) {
    if (missedTargets.includes(target)) {
      return false;
    }

    const { triggered, onShouldTriggerResult } = this.triggerSecondaryEffect({
      source,
      probability,
      onShouldTrigger: () => target.applyStatus(statusId, source, options),
    });
    if (triggered) {
      return onShouldTriggerResult;
    }
    return false;
  }

  /**
   * @param {object} param0
   * @param {BattlePokemon} param0.source
   * @param {BattlePokemon} param0.primaryTarget
   * @param {Array<BattlePokemon>} param0.allTargets
   * @param {Array<BattlePokemon>=} param0.missedTargets
   * @param {StatusConditionEnum} param0.statusId
   * @param {object=} param0.options
   * @param {number=} param0.probability
   */
  genericApplyAllStatus({
    source,
    primaryTarget,
    allTargets,
    missedTargets = [],
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

  // eslint-disable-next-line class-methods-use-this
  genericApplySingleEffect({
    source,
    target,
    // eslint-disable-next-line no-unused-vars
    primaryTarget,
    // eslint-disable-next-line no-unused-vars
    allTargets,
    missedTargets = [],
    effectId,
    duration,
    initialArgs = {},
    probability = 1,
  }) {
    if (missedTargets.includes(target)) {
      return false;
    }

    const { triggered, onShouldTriggerResult } = this.triggerSecondaryEffect({
      source,
      probability,
      onShouldTrigger: () =>
        target.applyEffect(effectId, duration, source, initialArgs),
    });
    if (triggered) {
      return onShouldTriggerResult;
    }
    return false;
  }

  /**
   * @template {EffectIdEnum} K
   * @param {object} param0
   * @param {BattlePokemon} param0.source
   * @param {BattlePokemon} param0.primaryTarget
   * @param {Array<BattlePokemon>} param0.allTargets
   * @param {Array<BattlePokemon>=} param0.missedTargets
   * @param {K} param0.effectId
   * @param {number} param0.duration
   * @param {EffectInitialArgsTypeFromId<K>=} param0.initialArgs
   * @param {number=} param0.probability
   */
  genericApplyAllEffects({
    source,
    primaryTarget,
    allTargets,
    missedTargets = [],
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

  // eslint-disable-next-line class-methods-use-this
  genericChangeSingleCombatReadiness({
    source,
    target,
    // eslint-disable-next-line no-unused-vars
    primaryTarget,
    // eslint-disable-next-line no-unused-vars
    allTargets,
    missedTargets = [],
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
   * @param {BattlePokemon} param0.source
   * @param {BattlePokemon} param0.primaryTarget
   * @param {Array<BattlePokemon>} param0.allTargets
   * @param {Array<BattlePokemon>=} param0.missedTargets
   * @param {number} param0.amount
   * @param {"boost" | "reduce"} param0.action
   * @param {number=} param0.probability
   * @param {boolean=} param0.triggerEvents
   */
  genericChangeAllCombatReadiness({
    source,
    primaryTarget,
    allTargets,
    missedTargets = [],
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
}

const movesToRegister = Object.freeze({
  [moveIdEnum.FIRE_PUNCH]: new Move({
    id: moveIdEnum.FIRE_PUNCH,
    name: "Fire Punch",
    type: pokemonTypes.FIRE,
    power: 75,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is punched with a fiery fist. It may also leave the target with a burn with a 50% chance.",
    execute({ source, primaryTarget, allTargets, missedTargets }) {
      this.genericDealAllDamage({
        source,
        primaryTarget,
        allTargets,
        missedTargets,
      });
      this.genericApplyAllStatus({
        source,
        primaryTarget,
        allTargets,
        statusId: statusConditions.BURN,
        probability: 0.5,
      });
    },
    tags: ["punch"],
  }),
  [moveIdEnum.ICE_PUNCH]: new Move({
    id: moveIdEnum.ICE_PUNCH,
    name: "Ice Punch",
    type: pokemonTypes.ICE,
    power: 75,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is punched with an icy fist. It may also leave the target frozen with a 50% chance.",
    execute(args) {
      this.genericDealAllDamage(args);
      this.genericApplyAllStatus({
        ...args,
        statusId: statusConditions.FROZEN,
        probability: 0.5,
      });
    },
    tags: ["punch"],
  }),
  [moveIdEnum.VINE_WHIP]: new Move({
    id: moveIdEnum.VINE_WHIP,
    name: "Vine Whip",
    type: pokemonTypes.GRASS,
    power: 60,
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
  [moveIdEnum.CONFUSION]: new Move({
    id: moveIdEnum.CONFUSION,
    name: "Confusion",
    type: pokemonTypes.PSYCHIC,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "The target is hit by a weak telekinetic force. This has a 25% chance to confuse the target for 1 turn.",
    execute(args) {
      this.genericDealAllDamage(args);
      this.genericApplyAllEffects({
        ...args,
        effectId: "confused",
        duration: 1,
        probability: 0.25,
      });
    },
  }),
  [moveIdEnum.PSYCHIC]: new Move({
    id: moveIdEnum.PSYCHIC,
    name: "Psychic",
    type: pokemonTypes.PSYCHIC,
    power: 65,
    accuracy: 90,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The target is hit by a strong telekinetic force. This has a 60% chance to lower the targets' Special Defense for 2 turns.",
    execute(args) {
      this.genericDealAllDamage(args);
      this.genericApplyAllEffects({
        ...args,
        effectId: "spdDown",
        duration: 2,
        probability: 0.6,
      });
    },
  }),
  [moveIdEnum.ICY_WIND]: new Move({
    id: moveIdEnum.ICY_WIND,
    name: "Icy Wind",
    type: pokemonTypes.ICE,
    power: 55,
    accuracy: 95,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The target is hit by a strong icy wind. This lowers targets' Spped for 2 turns.",
    execute(args) {
      this.genericDealAllDamage(args);
      this.genericApplyAllEffects({
        ...args,
        effectId: "speDown",
        duration: 2,
      });
    },
  }),
  [moveIdEnum.BRICK_BREAK]: new Move({
    id: moveIdEnum.BRICK_BREAK,
    name: "Brick Break",
    type: pokemonTypes.FIGHTING,
    power: 75,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is struck with a hard head made of iron. This removes the target's defensive buffs before dealing damage.",
    execute(args) {
      const { allTargets, missedTargets } = args;
      for (const target of allTargets) {
        const miss = missedTargets.includes(target);
        // if not miss, attempt to remove defUp, greaterDefUp, spdUp, greaterSpdUp
        if (!miss) {
          const /** @type {EffectIdEnum[]} */ buffsToRemove = [
              "defUp",
              "greaterDefUp",
              "spdUp",
              "greaterSpdUp",
            ];
          for (const buffId of buffsToRemove) {
            target.dispellEffect(buffId);
          }
        }
      }
      this.genericDealAllDamage(args);
    },
  }),
  [moveIdEnum.FEATHER_DANCE]: new Move({
    id: moveIdEnum.FEATHER_DANCE,
    name: "Feather Dance",
    type: pokemonTypes.FLYING,
    power: null,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user covers the target and surrounding enemies with feathers. The primary target's Attack is sharply lowered for 3 turns, while other targets' Attack is lowered for 3 turns.",
    execute(args) {
      const { source, primaryTarget, allTargets, missedTargets } = args;

      // Apply sharply lowered attack to the primary target
      this.genericApplySingleEffect({
        source,
        target: primaryTarget,
        primaryTarget,
        allTargets,
        missedTargets,
        effectId: "greaterAtkDown",
        duration: 3,
        initialArgs: {},
      });

      // Apply regular attack down to other targets
      for (const target of allTargets) {
        // Skip the primary target as it's already handled
        if (target === primaryTarget) continue;

        this.genericApplySingleEffect({
          source,
          target,
          primaryTarget,
          allTargets,
          missedTargets,
          effectId: "atkDown",
          duration: 3,
          initialArgs: {},
        });
      }
    },
  }),
  [moveIdEnum.DOOM_DESIRE]: new Move({
    id: moveIdEnum.DOOM_DESIRE,
    name: "Doom Desire",
    type: pokemonTypes.STEEL,
    power: 120,
    accuracy: 100,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "Two turns after this move is used, the user's strikes the target with a concentrated bundle of light (undispellable). This move also has a 10% chance to apply Perish Song.",
    execute(args) {
      this.genericApplyAllEffects({
        ...args,
        effectId: effectIdEnum.DOOM_DESIRE,
        duration: 2,
      });
      this.genericApplyAllEffects({
        ...args,
        effectId: "perishSong",
        duration: 3,
        probability: 0.1,
      });
    },
  }),
  [moveIdEnum.NIGHT_SLASH]: new Move({
    id: moveIdEnum.NIGHT_SLASH,
    name: "Night Slash",
    type: pokemonTypes.DARK,
    power: 70,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.BACK,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user slashes with a blade of darkness, inflicting additional true damage to the primary target equal to 5% of the user's attackß.",
    execute({ source, primaryTarget, allTargets, missedTargets }) {
      this.genericDealAllDamage({
        source,
        primaryTarget,
        allTargets,
        missedTargets,
        calculateDamageFunction: (args) => {
          const { target } = args;
          const baseDamage = source.calculateMoveDamage(args);

          // Add true damage only to the primary target
          if (!missedTargets.includes(target) && target === primaryTarget) {
            const trueDamage = Math.floor(source.getStat("atk") * 0.05);
            return baseDamage + trueDamage;
          }

          return baseDamage;
        },
      });
    },
  }),
  [moveIdEnum.IRON_HEAD]: new Move({
    id: moveIdEnum.IRON_HEAD,
    name: "Iron Head",
    type: pokemonTypes.STEEL,
    power: 90,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is struck with a hard head made of iron. This has a 50% chance to flinch.",
    execute(args) {
      this.genericDealAllDamage(args);
      this.genericApplyAllEffects({
        ...args,
        effectId: "flinched",
        duration: 1,
        probability: 0.5,
      });
    },
  }),
  [moveIdEnum.WOOD_HAMMER]: new Move({
    id: moveIdEnum.WOOD_HAMMER,
    name: "Wood Hammer",
    type: pokemonTypes.GRASS,
    power: 100,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The target is struck with a hard head made of iron. The user takes 33% recoil damage.",
    execute(args) {
      const { totalDamageDealt } = this.genericDealAllDamage(args);
      args.source.dealDamage(Math.floor(totalDamageDealt * 0.33), args.source, {
        type: "recoil",
      });
    },
  }),
  [moveIdEnum.QUASH]: new Move({
    id: moveIdEnum.QUASH,
    name: "Quash",
    type: pokemonTypes.DARK,
    power: null,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user supresses the target, reducing its combat readiness to 0 and sharply decreasing its Speed for 1 turn.",
    execute(args) {
      this.genericChangeAllCombatReadiness({
        ...args,
        amount: 100,
        action: "reduce",
      });
      this.genericApplyAllEffects({
        ...args,
        effectId: "greaterSpeDown",
        duration: 1,
      });
    },
  }),
  [moveIdEnum.ICICLE_CRASH]: new Move({
    id: moveIdEnum.ICICLE_CRASH,
    name: "Icicle Crash",
    type: pokemonTypes.ICE,
    power: 85,
    accuracy: 90,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user launches a sharp icicle at the target. This has a 30% chance to flinch.",
    execute(args) {
      this.genericDealAllDamage(args);
      this.genericApplyAllEffects({
        ...args,
        effectId: "flinched",
        duration: 1,
        probability: 0.3,
      });
    },
  }),
  [moveIdEnum.AQUA_IMPACT]: new Move({
    id: moveIdEnum.AQUA_IMPACT,
    name: "Aqua Impact",
    type: pokemonTypes.WATER,
    power: 50,
    accuracy: 90,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The targets are struck with a high-pressure flood of water. If hit, does true damage equal to 5% of the highest stat (excluding HP) among other Water or Dark type Pokemon on your team.",
    execute({ source, primaryTarget, allTargets, missedTargets }) {
      const sourceTeamPokemons = source.getPartyPokemon();
      let highestStat = 0;
      for (const pokemon of sourceTeamPokemons) {
        if (
          pokemon === source ||
          !pokemon ||
          pokemon.isFainted ||
          !(
            pokemon.hasType(pokemonTypes.WATER) ||
            pokemon.hasType(pokemonTypes.DARK)
          )
        ) {
          continue;
        }
        const pokemonHighestNonHpStat = pokemon
          .getAllStats()
          .slice(1, undefined)
          .reduce((highest, stat) => (stat > highest ? stat : highest), 0);
        if (pokemonHighestNonHpStat > highestStat) {
          highestStat = pokemonHighestNonHpStat;
        }
      }

      this.genericDealAllDamage({
        source,
        primaryTarget,
        allTargets,
        missedTargets,
        calculateDamageFunction: (args) => {
          const { target } = args;
          const baseDamage = source.calculateMoveDamage(args);
          if (!missedTargets.includes(target)) {
            const trueDamage = Math.floor(highestStat * 0.05);
            return baseDamage + trueDamage;
          }
          return baseDamage;
        },
      });
    },
  }),
  [moveIdEnum.MAGMA_IMPACT]: new Move({
    id: moveIdEnum.MAGMA_IMPACT,
    name: "Magma Impact",
    type: pokemonTypes.FIRE,
    power: 45,
    accuracy: 90,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The targets are struck with blades of magma. If hit and the target is not a full HP, deals 1.5x damage.",
    execute({ source, primaryTarget, allTargets, missedTargets }) {
      this.genericDealAllDamage({
        source,
        primaryTarget,
        allTargets,
        missedTargets,
        calculateDamageFunction: (args) => {
          const { target } = args;
          const baseDamage = source.calculateMoveDamage(args);
          if (!missedTargets.includes(target) && target.hp < target.maxHp) {
            return Math.floor(baseDamage * 1.5);
          }
          return baseDamage;
        },
      });
    },
  }),
  [moveIdEnum.FLAME_BALL]: new Move({
    id: moveIdEnum.FLAME_BALL,
    name: "Flame Ball",
    type: pokemonTypes.FIRE,
    power: 60,
    accuracy: 90,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user strikes the targets with an exploding fiery ball, heating up its allies. For each hit, boosts the combat readiness of a random Fire or Ground type ally by 15%.",
    execute({ battle, source, primaryTarget, allTargets, missedTargets }) {
      this.genericDealAllDamage({
        source,
        primaryTarget,
        allTargets,
        missedTargets,
      });

      const sourceTeamPokemons = source.getPartyPokemon();
      const fireGroundAllies = sourceTeamPokemons.filter(
        (pokemon) =>
          pokemon !== source &&
          pokemon &&
          !pokemon.isFainted &&
          (pokemon.hasType(pokemonTypes.FIRE) ||
            pokemon.hasType(pokemonTypes.GROUND))
      );
      if (fireGroundAllies.length === 0) {
        return;
      }
      const [randomAlly] = drawIterable(fireGroundAllies, 1);
      const hitCount = allTargets.reduce(
        (count, target) =>
          !missedTargets.includes(target) ? count + 1 : count,
        0
      );
      if (hitCount > 0) {
        battle.addToLog(
          `${randomAlly.name} is burning up from the Flame Ball!`
        );
        randomAlly.boostCombatReadiness(source, hitCount * 15);
      }
    },
  }),
  [moveIdEnum.BUG_BITE]: new Move({
    id: moveIdEnum.BUG_BITE,
    name: "Bug Bite",
    type: pokemonTypes.BUG,
    power: 70,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user bites the target. If the target is holding a berry, the user eats it and gains its effect. The user may also steal a random buff from the target.",
    execute({ battle, source, primaryTarget, allTargets, missedTargets }) {
      for (const target of allTargets) {
        const miss = missedTargets.includes(target);
        if (miss) continue;

        // If not miss, check for berry and steal it
        if (
          target.heldItem &&
          target.heldItem.heldItemId &&
          getHeldItemIdHasTag(target.heldItem.heldItemId, "berry")
        ) {
          const targetHeldItem = getHeldItem(target.heldItem.heldItemId);
          battle.addToLog(
            `${source.name} ate ${target.name}'s ${targetHeldItem.name}!`
          );
          target.useHeldItem(source);
        }

        // Try to steal a buff
        const possibleBuffs = /** @type {EffectIdEnum[]} */ (
          Object.keys(target.effectIds).filter((effectId) => {
            // @ts-ignore
            const effectData = getEffect(effectId);
            return (
              effectData.type === effectTypes.BUFF && effectData.dispellable
            );
          })
        );

        if (possibleBuffs.length > 0) {
          // Get random buff
          const buffIdToSteal =
            possibleBuffs[Math.floor(Math.random() * possibleBuffs.length)];
          const buffToSteal = target.effectIds[buffIdToSteal];

          // Steal buff
          const dispelled = target.dispellEffect(buffIdToSteal);
          if (dispelled) {
            // Apply buff to self
            source.applyEffect(
              buffIdToSteal,
              buffToSteal.duration,
              buffToSteal.source,
              buffToSteal.initialArgs
            );
          }
        }
      }
      this.genericDealAllDamage({
        source,
        primaryTarget,
        allTargets,
        missedTargets,
      });
    },
  }),
  [moveIdEnum.BITE]: new Move({
    id: moveIdEnum.BITE,
    name: "Bite",
    type: pokemonTypes.DARK,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user bites the target with sharp fangs. This has a 30% chance to make the target flinch.",
    execute(args) {
      this.genericDealAllDamage(args);
      this.genericApplyAllEffects({
        ...args,
        effectId: "flinched",
        duration: 1,
        probability: 0.3,
      });
    },
  }),
  [moveIdEnum.HEADBUTT]: new Move({
    id: moveIdEnum.HEADBUTT,
    name: "Headbutt",
    type: pokemonTypes.NORMAL,
    power: 50,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user rams its head into the target. This has a 30% chance to make the target flinch.",
    execute(args) {
      this.genericDealAllDamage(args);
      this.genericApplyAllEffects({
        ...args,
        effectId: "flinched",
        duration: 1,
        probability: 0.3,
      });
    },
  }),
  [moveIdEnum.FACADE]: new Move({
    id: moveIdEnum.FACADE,
    name: "Facade",
    type: pokemonTypes.NORMAL,
    power: 70,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "An attack that inflicts double damage if the user has a status condition.",
    execute(args) {
      const { source, battle } = args;
      this.genericDealAllDamage({
        ...args,
        calculateDamageFunction: (damageArgs) => {
          const baseDamage = source.calculateMoveDamage(damageArgs);

          // If the user has a status condition, double the damage
          if (source.status.statusId) {
            battle.addToLog(
              `${source.name} is furious! It's attacking with double power!`
            );
            return baseDamage * 2;
          }

          return baseDamage;
        },
      });
    },
  }),
  [moveIdEnum.HEAD_SMASH]: new Move({
    id: moveIdEnum.HEAD_SMASH,
    name: "Head Smash",
    type: pokemonTypes.ROCK,
    power: 200,
    accuracy: 80,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user attacks with a hazardous, full-power headbutt. This deals massive damage but the user takes 50% of the damage dealt as recoil.",
    execute(args) {
      const { source } = args;
      const { totalDamageDealt } = this.genericDealAllDamage(args);
      source.dealDamage(Math.floor(totalDamageDealt * 0.5), source, {
        type: "recoil",
      });
    },
  }),
  [moveIdEnum.BLOCK]: new Move({
    id: moveIdEnum.BLOCK,
    name: "Block",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user blocks the target's way, preventing escape. The target cannot gain boosted combat readiness for 2 turns.",
    execute(args) {
      this.genericApplyAllEffects({
        ...args,
        effectId: "restricted",
        duration: 2,
      });
    },
  }),
  [moveIdEnum.METAL_BURST]: new Move({
    id: moveIdEnum.METAL_BURST,
    name: "Metal Burst",
    type: pokemonTypes.STEEL,
    power: null,
    accuracy: 100,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.CROSS,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user retaliates with a powerful metal counterattack. This deals true damage equal to 75% of each target's attack, increased to 150% for the primary target.",
    execute({ source, primaryTarget, allTargets, missedTargets }) {
      for (const target of allTargets) {
        if (missedTargets.includes(target)) {
          continue;
        }

        const targetAttack = target.getStat("atk");
        const multiplier = target === primaryTarget ? 1.5 : 0.75;
        const damage = Math.floor(targetAttack * multiplier);
        source.dealDamage(damage, target, {
          type: "move",
          moveId: this.id,
        });
      }
    },
  }),
  [moveIdEnum.HEAL_ORDER]: new Move({
    id: moveIdEnum.HEAL_ORDER,
    name: "Heal Order",
    type: pokemonTypes.BUG,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user commands its healing bees to mend wounds. Heals the user or a targeted ally for 50% of their maximum HP.",
    execute({ source, allTargets }) {
      // TODO: functionify?
      for (const target of allTargets) {
        const healAmount = Math.floor(target.maxHp * 0.5);
        source.giveHeal(healAmount, target, {
          type: "move",
          moveId: this.id,
        });
      }
    },
  }),
  [moveIdEnum.DEFEND_ORDER]: new Move({
    id: moveIdEnum.DEFEND_ORDER,
    name: "Defend Order",
    type: pokemonTypes.BUG,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user commands its defensive bees to protect. Raises the target's Defense and Special Defense for 3 turns and creates a shield equal to 5% of their combined defenses.",
    execute(args) {
      const { allTargets } = args;
      for (const target of allTargets) {
        this.genericApplySingleEffect({
          ...args,
          effectId: "defUp",
          duration: 3,
          target,
        });
        this.genericApplySingleEffect({
          ...args,
          effectId: "spdUp",
          duration: 3,
          target,
        });

        // Calculate and apply shield based on combined defenses
        const defStat = target.getStat("def");
        const spdStat = target.getStat("spd");
        const shieldAmount = Math.floor((defStat + spdStat) * 0.05);
        this.genericApplySingleEffect({
          ...args,
          effectId: "shield",
          duration: 3,
          target,
          initialArgs: { shield: shieldAmount },
        });
      }
    },
  }),
  [moveIdEnum.ATTACK_ORDER]: new Move({
    id: moveIdEnum.ATTACK_ORDER,
    name: "Attack Order",
    type: pokemonTypes.BUG,
    power: 90,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user commands its offensive bees to attack. The attack's power increases by 10% for each non-fainted ally on the field.",
    execute(args) {
      const { source } = args;
      // Count non-fainted allies (excluding self) to boost damage
      const allyPokemons = source.getPartyPokemon();
      const nonFaintedAllies = allyPokemons.filter(
        (p) => p && !p.isFainted && p !== source
      ).length;
      const damageMultiplier = 1 + nonFaintedAllies * 0.1;

      this.genericDealAllDamage({
        ...args,
        calculateDamageFunction: (damageArgs) => {
          const baseDamage = source.calculateMoveDamage(damageArgs);
          return Math.floor(baseDamage * damageMultiplier);
        },
      });
    },
  }),
  [moveIdEnum.SWITCHEROO]: new Move({
    id: moveIdEnum.SWITCHEROO,
    name: "Switcheroo",
    type: pokemonTypes.DARK,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ANY,
    targetPosition: targetPositions.NON_SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user trades held items with the target faster than the eye can follow. This swaps the held items of the user and the target.",
    execute({ battle, source, primaryTarget }) {
      // Store the held item IDs
      const sourceHeldItemId = source.heldItem?.heldItemId;
      const targetHeldItemId = primaryTarget.heldItem?.heldItemId;
      // remove items
      source.removeHeldItem();
      primaryTarget.removeHeldItem();
      // Swap held items
      source.setHeldItem(targetHeldItemId);
      primaryTarget.setHeldItem(sourceHeldItemId);
      // Apply new held items
      source.applyHeldItem();
      primaryTarget.applyHeldItem();

      battle.addToLog(
        `${source.name} switched items with ${primaryTarget.name}!`
      );
    },
  }),
  [moveIdEnum.NUZZLE]: new Move({
    id: moveIdEnum.NUZZLE,
    name: "Nuzzle",
    type: pokemonTypes.ELECTRIC,
    power: 20,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user nuzzles its electrified cheeks against the target. This has a 60% chance to paralyze the target.",
    execute(args) {
      this.genericDealAllDamage(args);
      this.genericApplyAllStatus({
        ...args,
        statusId: statusConditions.PARALYSIS,
        probability: 0.6,
      });
    },
  }),
  [moveIdEnum.WILL_O_WISP]: new Move({
    id: moveIdEnum.WILL_O_WISP,
    name: "Will-O-Wisp",
    type: pokemonTypes.FIRE,
    power: null,
    accuracy: 90,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user sends a sinister flame at the target. This inflicts a burn on the target.",
    execute(args) {
      this.genericApplyAllStatus({
        ...args,
        statusId: statusConditions.BURN,
      });
    },
  }),
  [moveIdEnum.ENCORE]: new Move({
    id: moveIdEnum.ENCORE,
    name: "Encore",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ANY,
    targetPosition: targetPositions.NON_SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user forces the target to use a move for 1 turn. A random move that's on cooldown for the target is reset to 0 cooldown, and all other moves are disabled.",
    execute({ battle, source, allTargets }) {
      for (const target of allTargets) {
        // Find moves that are on cooldown
        const movesOnCooldown = Object.entries(target.moveIds)
          .filter(([, moveInfo]) => moveInfo.cooldown > 0)
          .map(([moveId]) => moveId);
        if (movesOnCooldown.length === 0) {
          battle.addToLog(
            `But it failed! ${target.name} has no moves on cooldown!`
          );
          continue;
        }

        // Select a random move on cooldown
        const [randomMoveId] = /** @type {MoveIdEnum[]} */ (
          drawIterable(movesOnCooldown, 1)
        );
        target.reduceMoveCooldown(randomMoveId, 99, source);
        // Apply the Encore effect, forcing the target to only use the selected move
        target.applyEffect(effectIdEnum.ENCORE, 1, source, {
          moveId: randomMoveId,
        });
      }
    },
  }),
  [moveIdEnum.SWAGGER]: new Move({
    id: moveIdEnum.SWAGGER,
    name: "Swagger",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: 85,
    cooldown: 2,
    targetType: targetTypes.ANY,
    targetPosition: targetPositions.NON_SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user enrages the target, confusing and sharply raising the target's Attack for 3 turns.",
    execute(args) {
      this.genericApplyAllEffects({
        ...args,
        effectId: "confused",
        duration: 3,
      });
      this.genericApplyAllEffects({
        ...args,
        effectId: "greaterAtkUp",
        duration: 3,
      });
    },
  }),
  [moveIdEnum.GYRO_BALL]: new Move({
    id: moveIdEnum.GYRO_BALL,
    name: "Gyro Ball",
    type: pokemonTypes.STEEL,
    power: null,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY, // Can target any opponent
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user tackles the target with a heavy, spinning steel ball. Power increases based on the target's Speed, and deals 1.5x damage if the user is slower than the target.",
    execute({ source, primaryTarget, allTargets, missedTargets }) {
      this.genericDealAllDamage({
        source,
        primaryTarget,
        allTargets,
        missedTargets,
        calculateDamageFunction: (args) => {
          const { target } = args;
          // Calculate power based on target's speed / 5
          const targetSpeed = target.getStat("spe");
          const basePower = Math.max(Math.floor(targetSpeed / 5), 1);

          // Check if user is slower than target
          const sourceSpeed = source.getStat("spe");
          const speedMultiplier = sourceSpeed < targetSpeed ? 1.5 : 1;

          // Calculate damage with the modified power
          const baseDamage = source.calculateMoveDamage({
            ...args,
            powerOverride: basePower,
          });

          // Apply the speed multiplier if applicable
          return Math.floor(baseDamage * speedMultiplier);
        },
      });
    },
  }),
  [moveIdEnum.PURSUIT]: new Move({
    id: moveIdEnum.PURSUIT,
    name: "Pursuit",
    type: pokemonTypes.DARK,
    power: 70,
    accuracy: 100,
    cooldown: 2,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user chases down a target, striking with doubled power if the target has higher Speed than the user. Has no back target damage penalty.",
    execute(args) {
      const { source } = args;
      this.genericDealAllDamage({
        ...args,
        backTargetDamageMultiplier: 1,
        calculateDamageFunction: (damageArgs) => {
          const { target } = damageArgs;
          const baseDamage = source.calculateMoveDamage(damageArgs);

          // Check if target has higher speed than the user
          const targetSpeed = target.getStat("spe");
          const sourceSpeed = source.getStat("spe");
          if (targetSpeed > sourceSpeed) {
            return baseDamage * 2;
          }

          return baseDamage;
        },
      });
    },
  }),
  [moveIdEnum.DRAGON_CLAW]: new Move({
    id: moveIdEnum.DRAGON_CLAW,
    name: "Dragon Claw",
    type: pokemonTypes.DRAGON,
    power: 80,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.X,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user slashes the target with sharp claws in an X pattern. It has no additional effects.",
    execute(args) {
      this.genericDealAllDamage(args);
    },
  }),
  [moveIdEnum.DARK_VOID]: new Move({
    id: moveIdEnum.DARK_VOID,
    name: "Dark Void",
    type: pokemonTypes.DARK,
    power: null,
    accuracy: 70,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.OTHER,
    description:
      "The user creates a void of darkness that puts all targets to sleep.",
    execute(args) {
      this.genericApplyAllStatus({
        ...args,
        statusId: statusConditions.SLEEP,
      });
    },
  }),
  [moveIdEnum.TRIPLE_AXEL]: new Move({
    id: moveIdEnum.TRIPLE_AXEL,
    name: "Triple Axel",
    type: pokemonTypes.ICE,
    power: 20,
    accuracy: 90,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.X,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "A consecutive three-kick attack that becomes more powerful with each successful hit. Each hit has a 90% accuracy.",
    execute(args) {
      const {
        source,
        primaryTarget,
        allTargets,
        missedTargets,
        extraOptions = {},
      } = args;
      const maxHits = 3;
      const { hitCounts = {}, currentHit = 1 } = extraOptions;
      const newHitCounts = { ...hitCounts };

      // Calculate damage with power boost based on previous hits
      this.genericDealAllDamage({
        ...args,
        calculateDamageFunction: (damageArgs) => {
          const { target } = damageArgs;
          const previousHits = hitCounts[target.id] || 0;
          const powerMultiplier = 1 + previousHits;
          return source.calculateMoveDamage({
            ...damageArgs,
            powerOverride: this.power * powerMultiplier,
          });
        },
      });

      // Update hit counts for targets that weren't missed
      for (const target of allTargets) {
        if (!missedTargets.includes(target)) {
          newHitCounts[target.id] = (hitCounts[target.id] || 0) + 1;
        }
      }

      // If we haven't reached max hits, execute the move again
      if (currentHit < maxHits) {
        source.executeMoveAgainstTarget({
          moveId: this.id,
          primaryTarget,
          extraOptions: {
            hitCounts: newHitCounts,
            currentHit: currentHit + 1,
          },
        });
      }
    },
  }),
});

module.exports = {
  Move,
  movesToRegister,
};
