/* eslint-disable no-param-reassign */
const { weatherConditions } = require("../../config/battleConfig");
const { types: pokemonTypes } = require("../../config/pokemonConfig");
const {
  abilityIdEnum,
  battleEventEnum,
  effectIdEnum,
} = require("../../enums/battleEnums");
const { logger } = require("../../log");
const {
  getIsActivePokemonCallback,
  getIsTargetPokemonCallback,
} = require("../engine/eventConditions");

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
      logger.error(
        `Ability ${this.id} not found on Pokemon ${pokemon.id} ${pokemon.name}. Real Ability ID: ${abilityInstance?.abilityId}`
      );
      return;
    }

    return /** @type {any} */ (abilityInstance);
  }
}

const abilitiesToRegister = Object.freeze({
  [abilityIdEnum.AQUA_POWER]: new Ability({
    id: abilityIdEnum.AQUA_POWER,
    name: "Aqua Power",
    description:
      "At the start of battle, if there's only one other Water or Dark type ally, increase its highest base stat (excluding HP or Speed) by 2x for 3 turns, and start rain.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: battle.registerListenerFunction({
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
              stat: highestStatIndex,
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
  [abilityIdEnum.MAGMA_POWER]: new Ability({
    id: abilityIdEnum.MAGMA_POWER,
    name: "Magma Power",
    description:
      "At the start of battle, if there's only one other Ground or Fire type ally, increase its combat readiness by 35%, and start harsh sunlight.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: battle.registerListenerFunction({
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
  [abilityIdEnum.ANGER_POINT]: new Ability({
    id: abilityIdEnum.ANGER_POINT,
    name: "Anger Point",
    description:
      "When the user takes more than 33% of its health of damage at once, sharply raise its Atk and Spa for 3 turns.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: battle.registerListenerFunction({
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
  [abilityIdEnum.REGENERATOR]: new Ability({
    id: abilityIdEnum.REGENERATOR,
    name: "Regenerator",
    description: "After the user's turn, heal 15% of its max HP.",
    abilityAdd({ battle, target }) {
      return {
        listenerId: battle.registerListenerFunction({
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
            target.battle.addToLog(
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
});

module.exports = {
  Ability,
  abilitiesToRegister,
};
