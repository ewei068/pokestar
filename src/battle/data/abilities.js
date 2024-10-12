/* eslint-disable no-param-reassign */
const { abilityIdEnum, battleEventEnum } = require("../../enums/battleEnums");
const { getIsActivePokemonCallback } = require("../engine/eventConditions");

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
}

const abilitiesToRegister = Object.freeze({
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
});

module.exports = {
  Ability,
  abilitiesToRegister,
};
