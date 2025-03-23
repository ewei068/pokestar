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
    offTargetDamageMultiplier = 0.8,
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
   * @param {CalculateMoveDamageImpl=} param0.calculateDamageFunction
   * @returns {GenericDealAllDamageResult}
   */
  genericDealAllDamage({
    source,
    primaryTarget,
    allTargets,
    missedTargets = [],
    offTargetDamageMultiplier = 0.8,
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
    probablity = 1,
  }) {
    let shouldApplyStatus = false;
    if (!missedTargets.includes(target)) {
      const roll = Math.random();
      if (roll < probablity) {
        shouldApplyStatus = true;
      } else if (
        source.hasAbility(abilityIdEnum.SERENE_GRACE) &&
        roll < 2 * probablity
      ) {
        source.battle.addToLog(`${source.name}'s Serene Grace activates!`);
        shouldApplyStatus = true;
      }
    }

    if (shouldApplyStatus) {
      return target.applyStatus(statusId, source, options);
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
   * @param {number=} param0.probablity
   */
  genericApplyAllStatus({
    source,
    primaryTarget,
    allTargets,
    missedTargets = [],
    statusId,
    options,
    probablity = 1,
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
        probablity,
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
    probablity = 1,
  }) {
    let shouldApplyEffect = false;
    if (!missedTargets.includes(target)) {
      const roll = Math.random();
      if (roll < probablity) {
        shouldApplyEffect = true;
      } else if (
        source.hasAbility(abilityIdEnum.SERENE_GRACE) &&
        roll < 2 * probablity
      ) {
        source.battle.addToLog(`${source.name}'s Serene Grace activates!`);
        shouldApplyEffect = true;
      }
    }

    if (shouldApplyEffect) {
      return target.applyEffect(effectId, duration, source, initialArgs);
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
   * @param {number=} param0.probablity
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
    probablity = 1,
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
        probablity,
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
    probablity = 1,
    triggerEvents = true,
  }) {
    const shouldChangeCombatReadiness =
      !missedTargets.includes(target) && Math.random() < probablity;

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
   * @param {number=} param0.probablity
   * @param {boolean=} param0.triggerEvents
   */
  genericChangeAllCombatReadiness({
    source,
    primaryTarget,
    allTargets,
    missedTargets = [],
    amount,
    action,
    probablity = 1,
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
        probablity,
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
        probablity: 0.5,
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
        probablity: 0.5,
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
        probablity: 0.25,
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
        probablity: 0.6,
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
        probablity: 0.1,
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
        probablity: 0.5,
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
        probablity: 0.3,
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
        probablity: 0.3,
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
        probablity: 0.3,
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
});

module.exports = {
  Move,
  movesToRegister,
};
