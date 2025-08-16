/* eslint-disable no-param-reassign */
const {
  weatherConditions,
  damageTypes,
  targetPatterns,
  statusConditions,
  statIndexToBattleStatId,
  effectTypes,
} = require("../../config/battleConfig");
const { types: pokemonTypes } = require("../../config/pokemonConfig");
const {
  abilityIdEnum,
  battleEventEnum,
  effectIdEnum,
  moveIdEnum,
} = require("../../enums/battleEnums");
const { getMoveIdHasTag } = require("../../utils/battleUtils");
const {
  getIsActivePokemonCallback,
  getIsTargetPokemonCallback,
  getIsSourcePokemonCallback,
  getIsInstanceOfType,
  composeConditionCallbacks,
  getIsTargetSameTeamCallback,
  getIsTargetOpponentCallback,
  getIsSourceSameTeamCallback,
  getIsNotSourcePokemonCallback,
} = require("../engine/eventConditions");
const { getMove } = require("./moveRegistry");
const { getEffect } = require("./effectRegistry");

/**
 * @template T
 */
class Ability {
  /**
   * @param {object} param0
   * @param {AbilityIdEnum} param0.id
   * @param {string} param0.name
   * @param {string} param0.description
   * @param {AbilityAddCallback<T>} param0.abilityAdd
   * @param {AbilityRemoveCallback<T>} param0.abilityRemove
   */
  constructor({ id, name, description, abilityAdd, abilityRemove }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.abilityAdd = abilityAdd;
    this.abilityRemove = abilityRemove;
    this.isLegacyAbility = false;
  }

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * @param {BattlePokemon} pokemon
   * @returns {{ abilityId: AbilityIdEnum, data: T, applied: boolean }=}
   */
  getAbilityInstance(pokemon) {
    const abilityInstance = pokemon.ability;
    if (abilityInstance?.abilityId !== this.id) {
      return;
    }

    return /** @type {any} */ (abilityInstance);
  }

  /**
   * TODO: figure out how to use event listener type as source of truth?
   * TODO: ability instance isn't properly typed probably due to circular dep or sm
   * @template {BattleEventEnum} K
   * @param {object} param0
   * @param {K} param0.eventName
   * @param {(args: Parameters<BattleEventListenerCallback<K>>[0] & { abilityInstance: { abilityId: AbilityIdEnum, data: T, applied: boolean } }) => void} param0.callback
   * @param {Battle} param0.battle
   * @param {BattlePokemon} param0.target
   * @param {BattleEventListenerConditionCallback<K>=} param0.conditionCallback function that returns true if the event should be executed. If undefined, always execute for event.
   * @returns {string} listenerId
   */
  registerListenerFunction({
    battle,
    target,
    eventName,
    callback,
    conditionCallback,
  }) {
    return battle.registerListenerFunction({
      eventName,
      callback: (args) => {
        const abilityInstance = this.getAbilityInstance(target);
        if (!abilityInstance || abilityInstance.abilityId !== this.id) {
          return;
        }

        args.abilityInstance = abilityInstance;
        return callback(args);
      },
      conditionCallback,
    });
  }
}

const abilitiesToRegister = Object.freeze({
  [abilityIdEnum.STENCH]: new Ability({
    id: abilityIdEnum.STENCH,
    name: "Stench",
    description:
      "When the Pokémon inflicts damage, it has a 10% chance to make the target flinch.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
          callback: ({ target: damagedTarget, source }) => {
            // 10% chance to make the target flinch
            if (Math.random() < 0.1) {
              battle.addToLog(
                `${damagedTarget.name} is affected by ${source.name}'s Stench!`
              );
              damagedTarget.applyEffect("flinched", 1, source, {});
            }
          },
          conditionCallback: getIsSourcePokemonCallback(target),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.AQUA_POWER]: new Ability({
    id: abilityIdEnum.AQUA_POWER,
    name: "Aqua Power",
    description:
      "At the start of battle, if there's only one other Water or Dark type ally, increase its highest base stat (excluding HP or Speed) by 2x (+) for 3 turns, and start rain.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BATTLE_BEGIN,
          callback: () => {
            const allyPokemons = target.getPartyPokemon();
            const otherWaterDarkAllies = allyPokemons.filter(
              (pokemon) =>
                pokemon !== target &&
                pokemon &&
                !pokemon.isFainted &&
                (pokemon.hasType(pokemonTypes.WATER) ||
                  pokemon.hasType(pokemonTypes.DARK))
            );
            if (otherWaterDarkAllies.length !== 1) {
              return;
            }
            const [allyPokemon] = otherWaterDarkAllies;
            battle.addToLog(`${target.name} blesses ${allyPokemon.name}!`);
            const baseStats = allyPokemon.getAllBaseStats();
            const highestStatIndex =
              baseStats
                .slice(1, 5)
                .reduce(
                  (maxIndex, stat, index, arr) =>
                    stat > arr[maxIndex] ? index : maxIndex,
                  0
                ) + 1; // +1 to account for HP
            allyPokemon.applyEffect(effectIdEnum.AQUA_BLESSING, 3, target, {
              // @ts-ignore
              statId: statIndexToBattleStatId[highestStatIndex],
            });

            battle.createWeather(weatherConditions.RAIN, target);
          },
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.FLAME_BODY]: new Ability({
    id: abilityIdEnum.FLAME_BODY,
    name: "Flame Body",
    description:
      "When the user is hit by a physical move, 50% chance to Burn the attacker.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_DAMAGE_TAKEN,
          callback: ({ source, damageInfo }) => {
            // TODO: make condition callback?
            const moveId = damageInfo?.moveId;
            if (
              !moveId ||
              getMove(moveId)?.damageType !== damageTypes.PHYSICAL
            ) {
              return;
            }

            if (Math.random() < 0.5) {
              battle.addToLog(
                `${target.name}'s Flame Body affects ${source.name}!`
              );
              source.applyStatus(statusConditions.BURN, target);
            }
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.MAGMA_POWER]: new Ability({
    id: abilityIdEnum.MAGMA_POWER,
    name: "Magma Power",
    description:
      "At the start of battle, if there's only one other Ground or Fire type ally, increase its combat readiness by 35%, and start harsh sunlight.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BATTLE_BEGIN,
          callback: () => {
            const allyPokemons = target.getPartyPokemon();
            const otherFireGroundAllies = allyPokemons.filter(
              (pokemon) =>
                pokemon !== target &&
                pokemon &&
                !pokemon.isFainted &&
                (pokemon.hasType(pokemonTypes.FIRE) ||
                  pokemon.hasType(pokemonTypes.GROUND))
            );
            if (otherFireGroundAllies.length !== 1) {
              return;
            }
            const [allyPokemon] = otherFireGroundAllies;
            battle.addToLog(`${target.name} blesses ${allyPokemon.name}!`);
            allyPokemon.boostCombatReadiness(target, 35);

            battle.createWeather(weatherConditions.SUN, target);
          },
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.SERENE_GRACE]: new Ability({
    id: abilityIdEnum.SERENE_GRACE,
    name: "Serene Grace",
    description:
      "Most moves have twice the chance to trigger secondary effects.",
    // effect is hard-coded in moves.js > triggerSecondaryEffect
    abilityAdd() {
      return {};
    },
    abilityRemove() {},
  }),
  [abilityIdEnum.ANGER_POINT]: new Ability({
    id: abilityIdEnum.ANGER_POINT,
    name: "Anger Point",
    description:
      "When the user takes more than 33% of its health of damage at once, sharply raise its Atk and Spa for 3 turns.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_DAMAGE_TAKEN,
          callback: ({ damage }) => {
            if (damage < target.maxHp * 0.33) {
              return;
            }
            battle.addToLog(`${target.name}'s Anger Point activates!`);
            target.applyEffect("greaterAtkUp", 3, target, {});
            target.applyEffect("greaterSpaUp", 3, target, {});
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.DOWNLOAD]: new Ability({
    id: abilityIdEnum.DOWNLOAD,
    name: "Download",
    description:
      "At the start of battle, raises the user's Atk or SpA for 4 turns based on the opponent's lower total defensive stat (Def or SpD).",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BATTLE_BEGIN,
          callback: () => {
            const enemyParty = target.getEnemyParty();
            const enemyTotalDefStats = enemyParty.pokemons.reduce(
              (acc, enemy) => {
                const defStat = enemy?.getStat?.("def") ?? 0;
                const spdStat = enemy?.getStat?.("spd") ?? 0;
                return {
                  def: acc.def + defStat,
                  spd: acc.spd + spdStat,
                };
              },
              { def: 0, spd: 0 }
            );

            const { def, spd } = enemyTotalDefStats;
            battle.addToLog(`${target.name}'s Download activates!`);
            if (def < spd) {
              target.applyEffect("atkUp", 4, target, {});
            } else {
              target.applyEffect("spaUp", 4, target, {});
            }
          },
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.IRON_FIST]: new Ability({
    id: abilityIdEnum.IRON_FIST,
    name: "Iron Fist",
    description: "Increases damage of punching moves by 30%.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_DEALT,
          callback: ({ damage, damageInfo }) => {
            const moveId = damageInfo?.moveId;
            if (getMoveIdHasTag(moveId, "punch")) {
              battle.addToLog(`${target.name}'s Iron Fist boosts its damage!`);
              return {
                damage: Math.floor(damage * 1.3),
              };
            }
          },
          conditionCallback: composeConditionCallbacks(
            getIsSourcePokemonCallback(target),
            getIsInstanceOfType("move")
          ),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.REGENERATOR]: new Ability({
    id: abilityIdEnum.REGENERATOR,
    name: "Regenerator",
    description: "After the user's turn, heal 15% of its max HP.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.TURN_END,
          callback: ({ activePokemon }) => {
            // heal 15% of max hp
            battle.addToLog(
              `${activePokemon.name}'s Regenerator restores its health!`
            );
            const healAmount = Math.floor(activePokemon.maxHp * 0.15);
            activePokemon.giveHeal(healAmount, activePokemon, {
              type: "regenerator",
            });
          },
          conditionCallback: getIsActivePokemonCallback(battle, target),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.BURNING_DRAFT]: new Ability({
    id: abilityIdEnum.BURNING_DRAFT,
    name: "Burning Draft",
    description:
      "When the user's turn ends, increase the combat readiness of all allies by 10%.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: battle.registerListenerFunction({
          eventName: battleEventEnum.TURN_END,
          callback: () => {
            const allyPokemons = target.getPartyPokemon();
            battle.addToLog(
              `${target.name}'s Burning Draft increases its allies' combat readiness!`
            );
            allyPokemons.forEach((ally) => {
              if (!ally) {
                return;
              }
              ally.boostCombatReadiness(target, 10);
            });
          },
          conditionCallback: getIsActivePokemonCallback(battle, target),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.JET_SPEED]: new Ability({
    id: abilityIdEnum.JET_SPEED,
    name: "Jet Speed",
    description:
      "When the weather is set to rain, increase the user's combat readiness by 20% and raise its Special Attack for 2 turns.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_WEATHER_SET,
          callback: () => {
            const { weather } = battle;
            if (weather.weatherId !== weatherConditions.RAIN) {
              return;
            }

            battle.addToLog(`${target.name} is pumped by the Rain!`);
            target.boostCombatReadiness(target, 20);
            target.applyEffect("spaUp", 2, target, {});
          },
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.ALPHA_CORE]: new Ability({
    id: abilityIdEnum.ALPHA_CORE,
    name: "Alpha Core",
    description:
      "The user is immune to instant-faint effects and takes reduced damage. When taking non-physical damage, gain 1 charge. At 4 charges, consume all charges to increase Spa/Spd by 25%, start Rain, and use Aqua Impact on a random enemy.",
    abilityAdd({ battle, target }) {
      return {
        afterDamageListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_DAMAGE_TAKEN,
          callback: ({ damageInfo, abilityInstance }) => {
            // TODO: make condition callback?
            const moveId = damageInfo?.moveId;
            if (
              moveId &&
              getMove(moveId)?.damageType === damageTypes.PHYSICAL
            ) {
              return;
            }

            abilityInstance.data.charges += 1;
            if (abilityInstance.data.charges < 4) {
              battle.addToLog(
                `${target.name} is charging its Alpha Core! Current charges: ${abilityInstance.data.charges}/4`
              );
              return;
            }

            battle.addToLog(
              `${target.name}'s Alpha Core reached maximum charges! Consuming charges to unleash its power! (+25% SpA/SpD, sets Rain, and uses Aqua Impact)`
            );
            abilityInstance.data.charges = 0;
            target.addStatMult("spa", 0.25);
            target.addStatMult("spd", 0.25);
            battle.createWeather(weatherConditions.RAIN, target);

            const enemyParty = target.getEnemyParty();
            const randomEnemy = target.getPatternTargets(
              enemyParty,
              targetPatterns.RANDOM,
              1,
              { moveId: moveIdEnum.AQUA_IMPACT }
            )[0]; // this target isn't the real enemy; but required for the move execution TODO: maybe improve this lol
            if (randomEnemy) {
              target.executeMoveAgainstTarget({
                moveId: moveIdEnum.AQUA_IMPACT,
                primaryTarget: randomEnemy,
              });
            }
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
        beforeDamageListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_TAKEN,
          callback: (args) => {
            const abilityData = args.abilityInstance.data;
            const { turn } = abilityData;
            abilityData.turn = battle.turn;
            if (turn !== battle.turn) {
              abilityData.damageTakenTurn = 0;
            }
            const damageTakenTurn = abilityData.damageTakenTurn || 0;
            abilityData.damageTakenTurn += args.damage;

            const { damage } = args;
            const { maxHp } = target;
            if (damage > maxHp * 0.055) {
              args.damage = Math.floor(maxHp * 0.055);
              args.maxDamage = Math.min(args.maxDamage, args.damage);
            }

            // if took more than 5% of max hp this turn, reduce damage down to 1% of max hp
            if (damageTakenTurn > 0.05 * maxHp && damage > maxHp * 0.01) {
              args.damage = Math.floor(maxHp * 0.01);
              args.maxDamage = Math.min(args.maxDamage, args.damage);
            }
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
        beforeCauseFaintListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_CAUSE_FAINT,
          callback: (args) => {
            args.canFaint = false;
            battle.addToLog(
              `${target.name}'s Alpha Core prevents it from fainting!`
            );
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
        charges: 0,
        turn: 0,
        damageTakenTurn: 0,
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.afterDamageListenerId);
      battle.unregisterListener(properties.beforeDamageListenerId);
      battle.unregisterListener(properties.beforeCauseFaintListenerId);
    },
  }),
  [abilityIdEnum.OMEGA_CORE]: new Ability({
    id: abilityIdEnum.OMEGA_CORE,
    name: "Omega Core",
    description:
      "The user is immune to instant-faint effects and takes reduced damage. When taking non-physical damage, gain 1 charge. At 4 charges, consume all charges to increase Atk/Def by 25%, start Harsh Sunlight, and use Magma Impact on a random enemy.",
    abilityAdd({ battle, target }) {
      return {
        afterDamageListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_DAMAGE_TAKEN,
          callback: ({ damageInfo, abilityInstance }) => {
            // TODO: make condition callback?
            const moveId = damageInfo?.moveId;
            if (moveId && getMove(moveId)?.damageType === damageTypes.SPECIAL) {
              return;
            }

            abilityInstance.data.charges += 1;
            if (abilityInstance.data.charges < 4) {
              battle.addToLog(
                `${target.name} is charging its Omega Core! Current charges: ${abilityInstance.data.charges}/4`
              );
              return;
            }

            battle.addToLog(
              `${target.name}'s Omega Core reached maximum charges! Consuming charges to unleash its power! (+25% Atk/Def, sets Sun, and uses Magma Impact)`
            );
            abilityInstance.data.charges = 0;
            target.addStatMult("atk", 0.25);
            target.addStatMult("def", 0.25);
            battle.createWeather(weatherConditions.SUN, target);

            const enemyParty = target.getEnemyParty();
            const randomEnemy = target.getPatternTargets(
              enemyParty,
              targetPatterns.RANDOM,
              1,
              { moveId: moveIdEnum.MAGMA_IMPACT }
            )[0]; // this target isn't the real enemy; but required for the move execution TODO: maybe improve this lol
            if (randomEnemy) {
              target.executeMoveAgainstTarget({
                moveId: moveIdEnum.MAGMA_IMPACT,
                primaryTarget: randomEnemy,
              });
            }
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
        beforeDamageListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_TAKEN,
          callback: (args) => {
            const abilityData = args.abilityInstance.data;
            const { turn } = abilityData;
            abilityData.turn = battle.turn;
            if (turn !== battle.turn) {
              abilityData.damageTakenTurn = 0;
            }
            const damageTakenTurn = abilityData.damageTakenTurn || 0;
            abilityData.damageTakenTurn += args.damage;

            const { damage } = args;
            const { maxHp } = target;
            if (damage > maxHp * 0.055) {
              args.damage = Math.floor(maxHp * 0.055);
              args.maxDamage = Math.min(args.maxDamage, args.damage);
            }

            // if took more than 5% of max hp this turn, reduce damage down to 1% of max hp
            if (damageTakenTurn > 0.05 * maxHp && damage > maxHp * 0.01) {
              args.damage = Math.floor(maxHp * 0.01);
              args.maxDamage = Math.min(args.maxDamage, args.damage);
            }
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
        beforeCauseFaintListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_CAUSE_FAINT,
          callback: (args) => {
            args.canFaint = false;
            battle.addToLog(
              `${target.name}'s Omega Core prevents it from fainting!`
            );
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
        charges: 0,
        turn: 0,
        damageTakenTurn: 0,
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.afterDamageListenerId);
      battle.unregisterListener(properties.beforeDamageListenerId);
      battle.unregisterListener(properties.beforeCauseFaintListenerId);
    },
  }),
  [abilityIdEnum.SIMPLE]: new Ability({
    id: abilityIdEnum.SIMPLE,
    name: "Simple",
    description: "Doubles the effect of most core stat changes on the Pokémon.",
    abilityAdd() {
      // The ability effect is implemented directly in BattlePokemon.getStat
      return {};
    },
    abilityRemove() {},
  }),
  [abilityIdEnum.AFTERMATH]: new Ability({
    id: abilityIdEnum.AFTERMATH,
    name: "Aftermath",
    description:
      "Damages the attacker by 1/5 of the user's max HP when knocked out.",
    abilityAdd({ battle, target }) {
      return {
        faintListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_FAINT,
          callback: ({ source }) => {
            if (!source || source.isFainted) {
              return;
            }

            const damage = Math.floor(target.maxHp / 5);
            battle.addToLog(`${target.name}'s Aftermath triggered!`);
            source.takeDamage(damage, target, {
              type: "ability",
              id: abilityIdEnum.AFTERMATH,
            });
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.faintListenerId);
    },
  }),
  [abilityIdEnum.FRIEND_GUARD]: new Ability({
    id: abilityIdEnum.FRIEND_GUARD,
    name: "Friend Guard",
    description:
      "Reduces damage taken by all allies including the user by 7.5%.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_TAKEN,
          callback: ({ damage, maxDamage }) => {
            const newDamage = Math.min(Math.floor(damage * 0.925), maxDamage);
            return {
              damage: newDamage,
            };
          },
          conditionCallback: getIsTargetSameTeamCallback(target),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.ROUGH_SKIN]: new Ability({
    id: abilityIdEnum.ROUGH_SKIN,
    name: "Rough Skin",
    description:
      "Damages the attacker by 8% of their max HP when hit with a physical move.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_DAMAGE_TAKEN,
          callback: ({ source, damageInfo }) => {
            const moveData = getMove(damageInfo.moveId);
            if (moveData?.damageType !== damageTypes.PHYSICAL) {
              return;
            }

            // Damage the attacker for 8% of their max HP
            const damage = Math.max(Math.floor(source.maxHp * 0.08), 1);
            battle.addToLog(
              `${source.name} was hurt by ${target.name}'s Rough Skin!`
            );
            source.takeDamage(damage, target, {
              type: "ability",
              id: this.id,
            });
          },
          conditionCallback: composeConditionCallbacks(
            getIsTargetPokemonCallback(target),
            getIsInstanceOfType("move")
          ),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.BAD_DREAMS]: new Ability({
    id: abilityIdEnum.BAD_DREAMS,
    name: "Bad Dreams",
    description:
      "At the end of each turn, any sleeping enemies take damage equal to 3% of their max HP.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.TURN_END,
          callback: () => {
            const enemyParty = target.getEnemyParty();
            for (const enemy of enemyParty.pokemons) {
              if (!enemy || enemy.isFainted) continue;

              if (enemy.status.statusId === statusConditions.SLEEP) {
                const damage = Math.max(Math.floor(enemy.maxHp * 0.03), 1);
                battle.addToLog(
                  `${enemy.name} is tormented by ${target.name}'s Bad Dreams!`
                );
                enemy.takeDamage(damage, target, {
                  type: "ability",
                  id: this.id,
                });
              }
            }
          },
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.SNOW_WARNING]: new Ability({
    id: abilityIdEnum.SNOW_WARNING,
    name: "Snow Warning",
    description: "When the battle starts, creates a hailstorm.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BATTLE_BEGIN,
          callback: () => {
            battle.addToLog(
              `${target.name}'s Snow Warning creates a hailstorm!`
            );
            battle.createWeather(weatherConditions.HAIL, target);
          },
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.MAGNET_PULL]: new Ability({
    id: abilityIdEnum.MAGNET_PULL,
    name: "Magnet Pull",
    description: "Enemy Steel-type Pokémon gain 80% less combat readiness.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_CR_GAINED,
          callback: ({ amount, target: crTarget }) => {
            if (crTarget.hasType(pokemonTypes.STEEL) && amount > 0) {
              battle.addToLog(
                `${crTarget.name} is being pulled by ${target.name}'s Magnet Pull!`
              );
              return {
                amount: Math.floor(amount * 0.2),
              };
            }
          },
          conditionCallback: getIsTargetOpponentCallback(target),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.MOTOR_DRIVE]: new Ability({
    id: abilityIdEnum.MOTOR_DRIVE,
    name: "Motor Drive",
    description:
      "When hit by an Electric-type move, the user negates the damage and gains increased Speed for 2 turns.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_TAKEN,
          callback: ({ damageInfo }) => {
            const moveId = damageInfo?.moveId;
            const moveData = getMove(moveId);
            if (moveData?.type === pokemonTypes.ELECTRIC) {
              battle.addToLog(
                `${target.name}'s Motor Drive activated! It's charged with electricity!`
              );
              target.applyEffect("speUp", 2, target, {});
              return {
                damage: 0,
                maxDamage: 0,
              };
            }
          },
          conditionCallback: composeConditionCallbacks(
            getIsTargetPokemonCallback(target),
            getIsInstanceOfType("move")
          ),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.POISON_HEAL]: new Ability({
    id: abilityIdEnum.POISON_HEAL,
    name: "Poison Heal",
    description:
      "When the user would take damage from poison or badly poison, instead heal for 10% of its max HP.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_TAKEN,
          callback: ({ damageInfo }) => {
            if (
              damageInfo?.statusId === statusConditions.POISON ||
              damageInfo?.statusId === statusConditions.BADLY_POISON
            ) {
              const healAmount = Math.max(Math.floor(target.maxHp * 0.1), 1);
              battle.addToLog(
                `${target.name}'s Poison Heal converts poison damage into healing!`
              );
              target.giveHeal(healAmount, target, {
                type: "ability",
                id: abilityIdEnum.POISON_HEAL,
              });
              return {
                damage: 0,
                maxDamage: 0,
              };
            }
          },
          conditionCallback: composeConditionCallbacks(
            getIsTargetPokemonCallback(target),
            getIsInstanceOfType("statusCondition")
          ),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.OVERCOAT]: new Ability({
    id: abilityIdEnum.OVERCOAT,
    name: "Overcoat",
    description:
      "Protects the Pokémon from weather damage and status conditions.",
    abilityAdd({ battle, target }) {
      return {
        beforeWeatherDamageListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_TAKEN,
          callback: () => {
            battle.addToLog(
              `${target.name}'s Overcoat protects it from weather damage!`
            );
            return {
              damage: 0,
              maxDamage: 0,
            };
          },
          conditionCallback: composeConditionCallbacks(
            getIsTargetPokemonCallback(target),
            getIsInstanceOfType("weather")
          ),
        }),
        beforeStatusAppliedListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_STATUS_APPLY,
          callback: () => {
            battle.addToLog(
              `${target.name}'s Overcoat protects it from status conditions!`
            );
            return {
              canApply: false,
            };
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.beforeWeatherDamageListenerId);
      battle.unregisterListener(properties.beforeStatusAppliedListenerId);
    },
  }),
  [abilityIdEnum.STAR_BOOST]: new Ability({
    id: abilityIdEnum.STAR_BOOST,
    name: "Star Boost",
    description:
      "At the end of the user's turn, boost the combat readiness of a random other ally by 10% for every year Pokestar has been around.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.TURN_END,
          callback: () => {
            const allyPokemons = target
              .getPartyPokemon()
              .filter(
                (pokemon) => pokemon && pokemon !== target && !pokemon.isFainted
              );
            if (!allyPokemons.length) {
              return;
            }

            const randomAlly =
              allyPokemons[Math.floor(Math.random() * allyPokemons.length)];
            battle.addToLog(
              `${target.name}'s Star Boost increases ${randomAlly.name}'s combat readiness!`
            );
            randomAlly.boostCombatReadiness(target, 20);
          },
          conditionCallback: getIsActivePokemonCallback(battle, target),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.DRY_SKIN]: new Ability({
    id: abilityIdEnum.DRY_SKIN,
    name: "Dry Skin",
    description:
      "At the end of the user's turn, if there's rain, heal 1/4th HP, but if there's sun, take 1/8th HP damage.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.TURN_END,
          callback: ({ activePokemon }) => {
            const { weather } = battle;
            if (
              weather.weatherId === weatherConditions.RAIN &&
              !battle.isWeatherNegated()
            ) {
              const healAmount = Math.max(
                Math.floor(activePokemon.maxHp * 0.25),
                1
              );
              battle.addToLog(
                `${activePokemon.name}'s Dry Skin absorbs moisture from the rain!`
              );
              activePokemon.giveHeal(healAmount, activePokemon, {
                type: "ability",
                id: abilityIdEnum.DRY_SKIN,
              });
            } else if (
              weather.weatherId === weatherConditions.SUN &&
              !battle.isWeatherNegated()
            ) {
              const damageAmount = Math.max(
                Math.floor(activePokemon.maxHp * 0.125),
                1
              );
              battle.addToLog(
                `${activePokemon.name}'s Dry Skin makes it suffer in the sun!`
              );
              activePokemon.takeDamage(damageAmount, activePokemon, {
                type: "ability",
                id: abilityIdEnum.DRY_SKIN,
              });
            }
          },
          conditionCallback: getIsActivePokemonCallback(battle, target),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.ADAPTABILITY]: new Ability({
    id: abilityIdEnum.ADAPTABILITY,
    name: "Adaptability",
    description:
      "Powers up the damage of moves of the same type as the Pokémon by 30%.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_DEALT,
          callback: ({ damage, damageInfo }) => {
            const moveId = damageInfo?.moveId;
            const moveData = getMove(moveId);

            // Check if the move type matches one of the Pokémon's types (STAB condition)
            if (target.hasType(moveData?.type)) {
              battle.addToLog(
                `${target.name}'s Adaptability powers up its STAB move!`
              );
              return {
                damage: Math.floor(damage * 1.3),
              };
            }
          },
          conditionCallback: composeConditionCallbacks(
            getIsSourcePokemonCallback(target),
            getIsInstanceOfType("move")
          ),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.SHARPNESS]: new Ability({
    id: abilityIdEnum.SHARPNESS,
    name: "Sharpness",
    description: "Powers up the damage of slicing moves by 50%.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_DEALT,
          callback: ({ damage, damageInfo }) => {
            const moveId = damageInfo?.moveId;
            if (getMoveIdHasTag(moveId, "slice")) {
              battle.addToLog(
                `${target.name}'s Sharpness powers up its slicing move!`
              );
              return {
                damage: Math.floor(damage * 1.5),
              };
            }
          },
          conditionCallback: composeConditionCallbacks(
            getIsSourcePokemonCallback(target),
            getIsInstanceOfType("move")
          ),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [abilityIdEnum.TELEPATHY]: new Ability({
    id: abilityIdEnum.TELEPATHY,
    name: "Telepathy",
    description:
      "The user cannot be damaged or inflicted with dispellable debuffs from allies (excluding self).",
    abilityAdd({ battle, target }) {
      const baseCallback = composeConditionCallbacks(
        getIsTargetPokemonCallback(target),
        getIsSourceSameTeamCallback(target),
        getIsNotSourcePokemonCallback(target)
      );
      return {
        beforeDamageListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_TAKEN,
          callback: () => {
            battle.addToLog(
              `${target.name}'s Telepathy prevents ally-infllicted damage!`
            );
            return {
              damage: 0,
              maxDamage: 0,
            };
          },
          conditionCallback: baseCallback,
        }),

        beforeEffectAddListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_EFFECT_ADD,
          callback: ({ source, effectId }) => {
            const effect = getEffect(effectId);
            if (effect?.type === effectTypes.DEBUFF && effect?.dispellable) {
              battle.addToLog(
                `${target.name}'s Telepathy prevented ${effect.name} from ${source.name}!`
              );
              return {
                canAdd: false,
              };
            }
          },
          conditionCallback: baseCallback,
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.beforeDamageListenerId);
      battle.unregisterListener(properties.beforeEffectAddListenerId);
    },
  }),
  [abilityIdEnum.SLOW_START]: new Ability({
    id: abilityIdEnum.SLOW_START,
    name: "Slow Start",
    description:
      "When the user enters battle, its Attack and Speed are lowered for 2 turns.",
    abilityAdd({ battle, target }) {
      battle.addToLog(
        `${target.name} can't get it going because of its Slow Start!`
      );
      target.applyEffect("atkDown", 2, target, {});
      target.applyEffect("speDown", 2, target, {});

      return {};
    },
    abilityRemove({ target }) {
      target.dispellEffect("atkDown");
      target.dispellEffect("speDown");
    },
  }),
  [abilityIdEnum.MULTITYPE]: new Ability({
    id: abilityIdEnum.MULTITYPE,
    name: "Multitype",
    description:
      "Boosts the damage of ally moves by 10% if it's the same type as the Multitype Pokemon.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_DEALT,
          callback: ({ damage, damageInfo, source }) => {
            const moveId = damageInfo?.moveId;
            const moveData = damageInfo?.instance || getMove(moveId);

            if (moveData && target.hasType(moveData.type)) {
              battle.addToLog(
                `${target.name}'s Multitype powers up ${source.name}'s move!`
              );
              return {
                damage: Math.floor(damage * 1.1),
              };
            }
          },
          conditionCallback: composeConditionCallbacks(
            getIsSourceSameTeamCallback(target),
            getIsInstanceOfType("move")
          ),
        }),
      };
    },
    abilityRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
});

module.exports = {
  Ability,
  abilitiesToRegister,
};
