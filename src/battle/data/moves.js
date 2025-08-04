const { types: pokemonTypes } = require("../../config/pokemonConfig");
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
const { getHeldItem } = require("./heldItemRegistry");
const { getEffect } = require("./effectRegistry");
const { getHeldItemIdHasTag } = require("../../utils/battleUtils");
const { moveIdEnum, effectIdEnum } = require("../../enums/battleEnums");
const { drawIterable } = require("../../utils/gachaUtils");
const { pokemonIdEnum } = require("../../enums/pokemonEnums");

/** @typedef {"charge" | "punch" | "slice"} MoveTag */

class Move {
  /**
   * @param {object} param0
   * @param {AllMoveIdEnum} param0.id
   * @param {string} param0.name
   * @param {PokemonTypeEnum} param0.type
   * @param {((this: Move, options?: {source?: BattlePokemon}) => PokemonTypeEnum)=} param0.getEffectiveType
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
   * @param {((Battle, BattlePokemon) => boolean)=} param0.silenceIf
   * @param {MoveTag[]=} param0.tags
   */
  constructor({
    id,
    name,
    type,
    getEffectiveType = () => this.type,
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
    silenceIf,
    tags = [],
  }) {
    /** @type {MoveIdEnum} */
    // @ts-ignore
    this.id = id;
    this.name = name;
    this.type = type;
    // maybe a hack we'll see
    this.getEffectiveType = (/** @type {any} */ ...args) =>
      getEffectiveType.call(this, ...args);
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
    this.silenceIf = silenceIf;
    this.chargeMoveEffectId = chargeMoveEffectId;
    this.tags = tags;
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
    execute() {
      this.genericDealAllDamage();
      this.genericApplyAllStatus({
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
    execute() {
      this.genericDealAllDamage();
      this.genericApplyAllStatus({
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
    execute() {
      this.genericDealAllDamage();
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
    execute() {
      this.genericDealAllDamage();
      this.genericApplyAllEffects({
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
    execute() {
      this.genericDealAllDamage();
      this.genericApplyAllEffects({
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
    execute() {
      this.genericDealAllDamage();
      this.genericApplyAllEffects({
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
    execute() {
      const { allTargets, missedTargets } = this;
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
      this.genericDealAllDamage();
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
    execute() {
      const { primaryTarget, allTargets } = this;

      // Apply sharply lowered attack to the primary target
      this.genericApplySingleEffect({
        target: primaryTarget,
        effectId: "greaterAtkDown",
        duration: 3,
        initialArgs: {},
      });

      // Apply regular attack down to other targets
      for (const target of allTargets) {
        // Skip the primary target as it's already handled
        if (target === primaryTarget) continue;

        this.genericApplySingleEffect({
          target,
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
    execute() {
      this.genericApplyAllEffects({
        effectId: effectIdEnum.DOOM_DESIRE,
        duration: 2,
      });
      this.genericApplyAllEffects({
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
    execute() {
      const { source, primaryTarget, missedTargets } = this;
      this.genericDealAllDamage({
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
    tags: ["slice"],
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
    execute() {
      this.genericDealAllDamage();
      this.genericApplyAllEffects({
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
    execute() {
      const { totalDamageDealt } = this.genericDealAllDamage();
      this.source.dealDamage(Math.floor(totalDamageDealt * 0.33), this.source, {
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
    execute() {
      this.genericChangeAllCombatReadiness({
        amount: 100,
        action: "reduce",
      });
      this.genericApplyAllEffects({
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
    execute() {
      this.genericDealAllDamage();
      this.genericApplyAllEffects({
        effectId: "flinched",
        duration: 1,
        probability: 0.3,
      });
    },
  }),
  [moveIdEnum.CRUSH_GRIP]: new Move({
    id: moveIdEnum.CRUSH_GRIP,
    name: "Crush Grip",
    type: pokemonTypes.NORMAL,
    power: 120,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user crushes the target with great force. If hit, this move increases its damage by 25% of the target's current HP.",
    execute() {
      this.genericDealAllDamage({
        calculateDamageFunction: (args) => {
          const { target } = args;
          const baseDamage = this.source.calculateMoveDamage(args);

          // Only add bonus damage if the target wasn't missed
          if (!this.missedTargets.includes(target)) {
            // Calculate bonus damage as 25% of current HP
            const bonusDamage = Math.floor(target.hp * 0.25);
            return baseDamage + bonusDamage;
          }

          return baseDamage;
        },
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
    execute() {
      const { source, missedTargets } = this;
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
    execute() {
      this.genericDealAllDamage({
        calculateDamageFunction: (args) => {
          const { target } = args;
          const baseDamage = this.source.calculateMoveDamage(args);
          if (
            !this.missedTargets.includes(target) &&
            target.hp < target.maxHp
          ) {
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
    execute() {
      this.genericDealAllDamage();
      const { source, allTargets, missedTargets, battle } = this;
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
    execute() {
      const { battle, source, allTargets, missedTargets } = this;
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
      this.genericDealAllDamage();
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
    execute() {
      this.genericDealAllDamage();
      this.genericApplyAllEffects({
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
    execute() {
      this.genericDealAllDamage();
      this.genericApplyAllEffects({
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
    execute() {
      const { source, battle } = this;
      this.genericDealAllDamage({
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
    execute() {
      const { source } = this;
      const { totalDamageDealt } = this.genericDealAllDamage();
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
    execute() {
      this.genericApplyAllEffects({
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
    execute() {
      const { source, primaryTarget, allTargets, missedTargets } = this;
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
          id: this.id,
          instance: this,
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
    execute() {
      this.genericHealAllTargets({
        healPercent: 50,
      });
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
    execute() {
      const { allTargets } = this;
      for (const target of allTargets) {
        this.genericApplySingleEffect({
          effectId: "defUp",
          duration: 3,
          target,
        });
        this.genericApplySingleEffect({
          effectId: "spdUp",
          duration: 3,
          target,
        });

        // Calculate and apply shield based on combined defenses
        const defStat = target.getStat("def");
        const spdStat = target.getStat("spd");
        const shieldAmount = Math.floor((defStat + spdStat) * 0.05);
        this.genericApplySingleEffect({
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
    execute() {
      const { source } = this;
      // Count non-fainted allies (excluding self) to boost damage
      const allyPokemons = source.getPartyPokemon();
      const nonFaintedAllies = allyPokemons.filter(
        (p) => p && !p.isFainted && p !== source
      ).length;
      const damageMultiplier = 1 + nonFaintedAllies * 0.1;

      this.genericDealAllDamage({
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
    execute() {
      const { battle, source, primaryTarget } = this;
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
    execute() {
      this.genericDealAllDamage();
      this.genericApplyAllStatus({
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
    execute() {
      this.genericApplyAllStatus({
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
    execute() {
      const { battle, source, allTargets } = this;
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
    execute() {
      this.genericApplyAllEffects({
        effectId: "confused",
        duration: 3,
      });
      this.genericApplyAllEffects({
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
    execute() {
      this.genericDealAllDamage({
        calculateDamageFunction: (args) => {
          const { target } = args;
          // Calculate power based on target's speed / 5
          const targetSpeed = target.getStat("spe");
          const basePower = Math.max(Math.floor(targetSpeed / 5), 1);

          // Check if user is slower than target
          const sourceSpeed = this.source.getStat("spe");
          const speedMultiplier = sourceSpeed < targetSpeed ? 1.5 : 1;

          // Calculate damage with the modified power
          const baseDamage = this.source.calculateMoveDamage({
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
    execute() {
      this.genericDealAllDamage({
        backTargetDamageMultiplier: 1,
        calculateDamageFunction: (damageArgs) => {
          const { target } = damageArgs;
          const baseDamage = this.source.calculateMoveDamage(damageArgs);

          // Check if target has higher speed than the user
          const targetSpeed = target.getStat("spe");
          const sourceSpeed = this.source.getStat("spe");
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
    execute() {
      this.genericDealAllDamage();
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
    execute() {
      this.genericApplyAllStatus({
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
    execute() {
      const {
        source,
        primaryTarget,
        allTargets,
        missedTargets,
        extraOptions = {},
      } = this;
      const maxHits = 3;
      const { hitCounts = {}, currentHit = 1 } = extraOptions;
      const newHitCounts = { ...hitCounts };

      // Calculate damage with power boost based on previous hits
      this.genericDealAllDamage({
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
  [moveIdEnum.ROCK_WRECKER]: new Move({
    id: moveIdEnum.ROCK_WRECKER,
    name: "Rock Wrecker",
    type: pokemonTypes.ROCK,
    power: 160,
    accuracy: 90,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.CROSS,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user hurls a huge boulder at the target. The user must recharge after using this move.",
    execute() {
      const { source } = this;
      this.genericDealAllDamage();
      source.applyEffect("recharge", 1, source, {});
    },
  }),
  [moveIdEnum.TRICK]: new Move({
    id: moveIdEnum.TRICK,
    name: "Trick",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 3,
    targetType: targetTypes.ANY,
    targetPosition: targetPositions.NON_SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user tricks the target into trading held items. This swaps the held items of the user and the target.",
    execute() {
      const { battle, source, primaryTarget } = this;
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
  [moveIdEnum.OVERHEAT]: new Move({
    id: moveIdEnum.OVERHEAT,
    name: "Overheat",
    type: pokemonTypes.FIRE,
    power: 110,
    accuracy: 90,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks the opposing team with intense flames. After using this move, the user's Special Attack stat is sharply lowered for 2 turns.",
    execute() {
      const { source } = this;
      this.genericDealAllDamage();
      source.applyEffect("greaterSpaDown", 2, source, {});
    },
  }),
  [moveIdEnum.AIR_SLASH]: new Move({
    id: moveIdEnum.AIR_SLASH,
    name: "Air Slash",
    type: pokemonTypes.FLYING,
    power: 65,
    accuracy: 90,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.POWER,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks with a blade of air that slices even the sky. This has a 25% chance to flinch the target.",
    execute() {
      this.genericDealAllDamage();
      this.genericApplyAllEffects({
        effectId: "flinched",
        duration: 1,
        probability: 0.25,
      });
    },
    tags: ["slice"],
  }),
  [moveIdEnum.HEAT_WAVE]: new Move({
    id: moveIdEnum.HEAT_WAVE,
    name: "Heat Wave",
    type: pokemonTypes.FIRE,
    power: 80,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user attacks by exhaling hot breath on the opposing team. This only deals damage to the target row, but has a 30% of burning all targets",
    execute() {
      const { source, primaryTarget } = this;
      // Get only target row
      const targetParty = source.battle.parties[primaryTarget.teamName];
      const damageTargets = source.getPatternTargets(
        targetParty,
        targetPatterns.ROW,
        primaryTarget.position,
        { moveId: this.id }
      );

      // Deal damage only to targets in the primary target's row
      this.genericDealAllDamage({
        allTargets: damageTargets,
      });

      // Apply burn chance to all targets
      this.genericApplyAllStatus({
        statusId: statusConditions.BURN,
        probability: 0.3,
      });
    },
  }),
  [moveIdEnum.SOLAR_BLADE]: new Move({
    id: moveIdEnum.SOLAR_BLADE,
    name: "Solar Blade",
    type: pokemonTypes.GRASS,
    power: 160,
    accuracy: 100,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "A two-turn attack. The user gathers light, then attacks with a blade of light on the next turn.",
    silenceIf(battle, pokemon) {
      return (
        pokemon.effectIds.absorbLight === undefined &&
        !battle.isWeatherNegated() &&
        battle.weather.weatherId !== weatherConditions.SUN
      );
    },
    tags: ["charge", "slice"],
    chargeMoveEffectId: "absorbLight",
    execute() {
      const { source, battle } = this;
      // If pokemon doesn't have "absorb light" buff, apply it
      // TODO: genericify charge moves?
      if (
        source.effectIds.absorbLight === undefined &&
        !battle.isWeatherNegated() &&
        battle.weather.weatherId !== weatherConditions.SUN
      ) {
        source.applyEffect("absorbLight", 1, source, {});
        // Remove cooldown so it can be used next turn
        source.moveIds[this.id].cooldown = 0;
      } else {
        // If pokemon has "absorb light" buff, remove it and deal damage
        source.removeEffect("absorbLight");

        // Deal damage with weather multiplier
        this.genericDealAllDamage({
          calculateDamageFunction: (damageArgs) => {
            const mult =
              battle.weather.weatherId !== weatherConditions.SUN &&
              battle.weather.weatherId &&
              !battle.isWeatherNegated()
                ? 0.5
                : 1;
            return source.calculateMoveDamage({
              ...damageArgs,
              powerOverride: Math.floor(this.power * mult),
            });
          },
        });
      }
    },
  }),
  [moveIdEnum.MYSTICAL_POWER]: new Move({
    id: moveIdEnum.MYSTICAL_POWER,
    name: "Mystical Power",
    type: pokemonTypes.PSYCHIC,
    power: 70,
    accuracy: 90,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.X,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user unleashes mystical energy, damaging enemies based on the highest of the user's non-HP stats. Provides allies with unique buffs if used by Uxie, Mesprit, or Azelf.",
    execute() {
      const { source } = this;
      // apply special effect to all allies
      const allies = source.getPartyPokemon().filter((p) => p && !p.isFainted);
      for (const ally of allies) {
        if (source.speciesId === pokemonIdEnum.UXIE) {
          ally.applyEffect("defUp", 3, ally, {});
          ally.applyEffect("spdUp", 3, ally, {});
        } else if (source.speciesId === pokemonIdEnum.MESPRIT) {
          ally.applyEffect("regeneration", 3, ally, {
            healAmount: Math.floor(ally.maxHp * 0.2),
          });
        } else if (source.speciesId === pokemonIdEnum.AZELF) {
          ally.applyEffect("atkUp", 3, ally, {});
          ally.applyEffect("spaUp", 3, ally, {});
        }
      }
      this.genericDealAllDamage({
        attackOverride: source.getStat(source.getHighestNonHpStatId()),
      });
    },
  }),
  [moveIdEnum.AMNESIA]: new Move({
    id: moveIdEnum.AMNESIA,
    name: "Amnesia",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user empties their mind, sharply raising their Special Defense and providing a shield equal to 15% of their Special Defense.",
    execute() {
      const { allTargets } = this;
      this.genericApplyAllEffects({
        effectId: "greaterSpdUp",
        duration: 3,
      });

      for (const target of allTargets) {
        this.genericApplySingleEffect({
          target,
          effectId: "shield",
          duration: 3,
          initialArgs: {
            shield: Math.floor(target.getStat("spd") * 0.15),
          },
        });
      }
    },
  }),
  [moveIdEnum.MAGMA_STORM]: new Move({
    id: moveIdEnum.MAGMA_STORM,
    name: "Magma Storm",
    type: pokemonTypes.FIRE,
    power: 80,
    accuracy: 75,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "Traps the foe in a vortex of searing magma, dealing damage and restricting movement. The vortex causes ongoing 1/8th HP damage for 3 turns.",
    execute() {
      const { allTargets } = this;
      this.genericDealAllDamage();

      // Apply restricted and DoT effects to targets
      for (const target of allTargets) {
        this.genericApplySingleEffect({
          target,
          effectId: "restricted",
          duration: 3,
        });
        this.genericApplySingleEffect({
          target,
          effectId: "dot",
          duration: 3,
          initialArgs: {
            damage: Math.max(Math.floor(target.maxHp / 8), 1),
          },
        });
      }
    },
  }),
  [moveIdEnum.LUNAR_BLESSING]: new Move({
    id: moveIdEnum.LUNAR_BLESSING,
    name: "Lunar Blessing",
    type: pokemonTypes.FAIRY,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user bathes allies in mystical moonlight, healing them for 25% of their maximum HP, removing all status conditions, and dispelling all debuffs.",
    execute() {
      const { allTargets } = this;
      this.genericHealAllTargets({
        healPercent: 25,
      });

      // Remove status conditions and debuffs from all allies
      for (const target of allTargets) {
        target.removeStatus();
        for (const effectId of /** @type {EffectIdEnum[]} */ (
          Object.keys(target.effectIds)
        )) {
          const effect = getEffect(effectId);
          if (effect.type === effectTypes.DEBUFF) {
            target.dispellEffect(effectId);
          }
        }
      }
    },
  }),
  [moveIdEnum.LUNAR_DANCE]: new Move({
    id: moveIdEnum.LUNAR_DANCE,
    name: "Lunar Dance",
    type: pokemonTypes.PSYCHIC,
    power: null,
    accuracy: null,
    cooldown: 4,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user dances in the moonlight, sacrificing 50% of its maximum HP to heal allies (excluding itself) by the same amount and increase their Defense and Special Defense for 2 turns.",
    execute() {
      const { source } = this;

      // Calculate the amount of HP to sacrifice (50% of max HP)
      const sacrificeAmount = Math.floor(source.maxHp * 0.5);

      // Sacrifice HP from the user
      source.dealDamage(sacrificeAmount, source, {
        type: "self",
      });

      // Create a new array of targets excluding the source
      const healTargets = this.allTargets.filter((target) => target !== source);
      if (healTargets.length > 0) {
        this.genericHealAllTargets({
          allTargets: healTargets,
          healAmount: sacrificeAmount,
        });
      }
      this.genericApplyAllEffects({
        effectId: "defUp",
        duration: 2,
      });
      this.genericApplyAllEffects({
        effectId: "spdUp",
        duration: 2,
      });
    },
  }),
  [moveIdEnum.TRI_ATTACK]: new Move({
    id: moveIdEnum.TRI_ATTACK,
    name: "Tri Attack",
    type: pokemonTypes.NORMAL,
    power: 66,
    accuracy: 100,
    cooldown: 3,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.RANDOM,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user strikes with three different elemental attacks in succession. The first hit has a 33% chance to burn, the second has a 33% chance to paralyze, and the third has a 33% chance to freeze.",
    execute() {
      const { source, primaryTarget, extraOptions = {} } = this;
      const maxHits = 3;
      const { currentHit = 1 } = extraOptions;

      // Deal damage for the current hit
      this.genericDealAllDamage();

      // Apply the appropriate status effect based on the current hit
      if (currentHit === 1) {
        this.genericApplyAllStatus({
          statusId: statusConditions.BURN,
          probability: 0.33,
        });
      } else if (currentHit === 2) {
        this.genericApplyAllStatus({
          statusId: statusConditions.PARALYSIS,
          probability: 0.33,
        });
      } else if (currentHit === 3) {
        this.genericApplyAllStatus({
          statusId: statusConditions.FREEZE,
          probability: 0.33,
        });
      }

      // If we haven't reached max hits, execute the move again
      if (currentHit < maxHits) {
        source.executeMoveAgainstTarget({
          moveId: this.id,
          primaryTarget,
          extraOptions: {
            currentHit: currentHit + 1,
          },
        });
      }
    },
  }),
  [moveIdEnum.PSYCHO_CUT]: new Move({
    id: moveIdEnum.PSYCHO_CUT,
    name: "Psycho Cut",
    type: pokemonTypes.PSYCHIC,
    power: 70,
    accuracy: 100,
    cooldown: 4,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.POWER,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user tears at the target with blades formed by psychic power. This has no damage reduction when hitting back row or non-primary targets.",
    execute() {
      this.genericDealAllDamage({
        offTargetDamageMultiplier: 1,
        backTargetDamageMultiplier: 1,
      });
    },
  }),
  [moveIdEnum.STAR_CELEBRATE]: new Move({
    id: moveIdEnum.STAR_CELEBRATE,
    name: "Star Celebrate",
    type: pokemonTypes.NORMAL,
    power: null,
    accuracy: null,
    cooldown: 2,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.ALL,
    tier: moveTiers.POWER,
    damageType: damageTypes.OTHER,
    description:
      "The user celebrates the anniversary of Pokestar, increasing allies' combat readiness by 10% and permanently increasing their non-HP stats by 2%, multiplied by the number of years Pokestar has been around.",
    execute() {
      const { allTargets, battle } = this;
      // Boost combat readiness by 20%
      this.genericChangeAllCombatReadiness({
        amount: 20,
        action: "boost",
      });

      // Permanently increase all non-HP stats by 2%
      for (const target of allTargets) {
        const statIds = /** @type {StatIdNoHP[]} */ ([
          "atk",
          "def",
          "spa",
          "spd",
          "spe",
        ]);

        for (const statId of statIds) {
          target.multiplyStatMult(statId, 1.02);
        }

        battle.addToLog(`${target.name}'s stats were permanently increased!`);
      }
    },
  }),
  [moveIdEnum.COACHING]: new Move({
    id: moveIdEnum.COACHING,
    name: "Coaching",
    type: pokemonTypes.FIGHTING,
    power: null,
    accuracy: null,
    cooldown: 0,
    targetType: targetTypes.ALLY,
    targetPosition: targetPositions.NON_SELF,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.OTHER,
    description:
      "The user coaches an ally, boosting its Attack and Defense for 2 turns.",
    execute() {
      this.genericApplyAllEffects({
        effectId: "atkUp",
        duration: 2,
      });
      this.genericApplyAllEffects({
        effectId: "defUp",
        duration: 2,
      });
    },
  }),
  [moveIdEnum.SACRED_SWORD]: new Move({
    id: moveIdEnum.SACRED_SWORD,
    name: "Sacred Sword",
    type: pokemonTypes.FIGHTING,
    power: 90,
    accuracy: null,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.COLUMN,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user slashes with a sword honed to exceptional sharpness. This attack ignores the target's defensive boosts and has perfect accuracy.",
    execute() {
      this.genericDealAllDamage({
        calculateDamageFunction: (damageArgs) => {
          const { target } = damageArgs;
          // Override defense with base defense to ignore boosts
          return this.source.calculateMoveDamage({
            ...damageArgs,
            defenseOverride: target.bdef,
          });
        },
      });
    },
  }),
  [moveIdEnum.SLASH]: new Move({
    id: moveIdEnum.SLASH,
    name: "Slash",
    type: pokemonTypes.NORMAL,
    power: 35,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.BASIC,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user slashes at the target with sharp claws or blades, striking all enemies in the row.",
    execute() {
      this.genericDealAllDamage();
    },
    tags: ["slice"],
  }),
  [moveIdEnum.ROAR_OF_TIME]: new Move({
    id: moveIdEnum.ROAR_OF_TIME,
    name: "Roar of Time",
    type: pokemonTypes.DRAGON,
    power: 140,
    accuracy: 90,
    cooldown: 6,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.FRONT,
    targetPattern: targetPatterns.ROW,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user roars to distort time, dealing massive damage. Fully reduces the highest move cooldown for each adjacent ally, and the user must recharge for 1 turn.",
    execute() {
      const { source } = this;
      this.genericDealAllDamage();

      // Get adjacent allies (SQUARE pattern excluding self)
      const sourceParty = source.battle.parties[source.teamName];
      const adjacentAllies = source
        .getPatternTargets(
          sourceParty,
          targetPatterns.SQUARE,
          source.position,
          {
            ignoreHittable: true,
          }
        )
        .filter((pokemon) => pokemon !== source);

      // Reduce highest cooldown for each adjacent ally
      for (const ally of adjacentAllies) {
        // Find move(s) with the highest cooldown
        let highestCooldown = 0;
        let highestCooldownMoves = [];

        for (const [moveId, moveInfo] of Object.entries(ally.moveIds)) {
          if (moveInfo.cooldown > highestCooldown) {
            highestCooldown = moveInfo.cooldown;
            highestCooldownMoves = [moveId];
          } else if (
            moveInfo.cooldown === highestCooldown &&
            highestCooldown > 0
          ) {
            highestCooldownMoves.push(moveId);
          }
        }

        // If there are moves on cooldown, reset a random one
        if (highestCooldownMoves.length > 0) {
          const [randomMoveId] = drawIterable(highestCooldownMoves, 1);
          const resetAmount = ally.moveIds[randomMoveId].cooldown;
          ally.reduceMoveCooldown(randomMoveId, resetAmount, source);
        }
      }

      // Apply recharge effect to the user
      source.applyEffect("recharge", 1, source, {});
    },
  }),
  [moveIdEnum.SPACIAL_REND]: new Move({
    id: moveIdEnum.SPACIAL_REND,
    name: "Spacial Rend",
    type: pokemonTypes.DRAGON,
    power: 80,
    accuracy: null,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.X,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.SPECIAL,
    description:
      "The user tears the spatial fabric, dealing damage to enemies. Adjacent allies receive a spatial blessing that enhances their move patterns for 1 turn.",
    execute() {
      const { source } = this;
      this.genericDealAllDamage();

      const sourceParty = source.battle.parties[source.teamName];
      const adjacentAllies = source
        .getPatternTargets(
          sourceParty,
          targetPatterns.SQUARE,
          source.position,
          {
            ignoreHittable: true,
          }
        )
        .filter((pokemon) => !pokemon.isFainted);
      for (const ally of adjacentAllies) {
        ally.applyEffect(effectIdEnum.SPATIAL_BLESSING, 1, source, {});
      }
    },
  }),
  [moveIdEnum.SHADOW_FORCE]: new Move({
    id: moveIdEnum.SHADOW_FORCE,
    name: "Shadow Force",
    type: pokemonTypes.GHOST,
    power: 111,
    accuracy: 90,
    cooldown: 5,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SQUARE,
    tier: moveTiers.ULTIMATE,
    damageType: damageTypes.PHYSICAL,
    description:
      "The user disappears and strikes the targets on the next turn, removing their buffs if hit. The user may receive a boost from the shadows depending on its form.",
    silenceIf(_battle, pokemon) {
      return pokemon.effectIds[effectIdEnum.VANISHED] === undefined;
    },
    tags: ["charge"],
    chargeMoveEffectId: effectIdEnum.VANISHED,
    execute() {
      const { source, battle } = this;
      // If pokemon doesn't have "vanished" buff, apply it
      if (source.effectIds[effectIdEnum.VANISHED] === undefined) {
        source.applyEffect(effectIdEnum.VANISHED, 1, source, {});
        source.moveIds[this.id].cooldown = 0;

        // Special effects for Giratina forms
        if (source.speciesId === pokemonIdEnum.GIRATINA_ALTERED) {
          battle.addToLog(`${source.name} restores its power in the shadows!`);
          this.genericHealSingleTarget({
            source,
            target: source,
            healPercent: 40,
          });
        } else if (source.speciesId === pokemonIdEnum.GIRATINA_ORIGIN) {
          battle.addToLog(`${source.name} powers-up in the shadows!`);
          source.applyEffect("greaterAtkUp", 2, source, {});
        }
      } else {
        source.removeEffect(effectIdEnum.VANISHED);
        // remove all buffs from targets
        for (const target of this.allTargets) {
          this.triggerSecondaryEffectOnTarget({
            target,
            onShouldTrigger: () => {
              for (const effectId of Object.keys(target.effectIds)) {
                // @ts-ignore
                target.dispellEffect(effectId);
              }
            },
          });
        }
        this.genericDealAllDamage();
      }
    },
  }),
  [moveIdEnum.OMINOUS_WIND]: new Move({
    id: moveIdEnum.OMINOUS_WIND,
    name: "Ominous Wind",
    type: pokemonTypes.GHOST,
    power: 45,
    accuracy: 100,
    cooldown: 0,
    targetType: targetTypes.ENEMY,
    targetPosition: targetPositions.ANY,
    targetPattern: targetPatterns.SINGLE,
    tier: moveTiers.BASIC,
    damageType: damageTypes.SPECIAL,
    description:
      "The user blasts the target with a gust of repulsive wind. This may also raise the user's highest non-HP stat with a 50% chance.",
    execute() {
      const { source } = this;
      this.genericDealAllDamage();
      this.triggerSecondaryEffect({
        probability: 0.5,
        onShouldTrigger: () => {
          // get highest non-hp base stat
          const statValues = [
            source.batk,
            source.bdef,
            source.bspa,
            source.bspd,
            source.bspe,
          ];
          // argmax
          const highestStatIndex = statValues.reduce(
            (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
            0
          );
          switch (highestStatIndex + 1) {
            case 1:
              source.applyEffect("atkUp", 1, source, {});
              break;
            case 2:
              source.applyEffect("defUp", 1, source, {});
              break;
            case 3:
              source.applyEffect("spaUp", 1, source, {});
              break;
            case 4:
              source.applyEffect("spdUp", 1, source, {});
              break;
            case 5:
              source.applyEffect("speUp", 1, source, {});
              break;
            default:
              break;
          }
        },
      });
    },
  }),
});

module.exports = {
  Move,
  movesToRegister,
};
