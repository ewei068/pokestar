/* eslint-disable no-param-reassign */
const { backpackHeldItemConfig } = require("../../config/backpackConfig");
const { battleEventEnum, heldItemIdEnum } = require("../../enums/battleEnums");
const { getIsActivePokemonCallback } = require("../engine/eventConditions");

/**
 * @typedef {"berry" | "placeholderTag"} HeldItemTag
 */

/**
 * @template T
 */
class HeldItem {
  /**
   * @param {object} param0
   * @param {HeldItemIdEnum} param0.id
   * @param {HeldItemAddCallback<T>} param0.itemAdd
   * @param {HeldItemRemoveCallback<T>} param0.itemRemove
   * @param {HeldItemTag[]?=} param0.tags
   */
  constructor({ id, itemAdd, itemRemove, tags = [] }) {
    this.id = id;
    const itemData = backpackHeldItemConfig[id];
    this.name = itemData.name;
    this.description = itemData.description;
    this.itemAdd = itemAdd;
    this.itemRemove = itemRemove;
    this.isLegacyAbility = false;
    this.tags = tags;
  }

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * @param {BattlePokemon} pokemon
   * @returns {{ heldItemId: HeldItemIdEnum, data: T, applied: boolean }=}
   */
  getHeldItemInstance(pokemon) {
    const heldItemInstance = pokemon.heldItem;
    if (heldItemInstance?.heldItemId !== this.id) {
      return;
    }

    return /** @type {any} */ (heldItemInstance);
  }

  /**
   * TODO: figure out how to use event listener type as source of truth?
   * TODO: held item instance isn't properly typed probably due to circular dep or sm
   * @template {BattleEventEnum} K
   * @param {object} param0
   * @param {K} param0.eventName
   * @param {(args: Parameters<BattleEventListenerCallback<K>>[0] & { heldItemInstance: { heldItemId: HeldItemIdEnum, data: T, applied: boolean } }) => void} param0.callback
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
        const heldItemInstance = this.getHeldItemInstance(target);
        if (!heldItemInstance || heldItemInstance.heldItemId !== this.id) {
          return;
        }

        args.heldItemInstance = heldItemInstance;
        callback(args);
      },
      conditionCallback,
    });
  }
}

const heldItemsToRegister = Object.freeze({
  [heldItemIdEnum.LEFTOVERS]: new HeldItem({
    id: heldItemIdEnum.LEFTOVERS,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.TURN_END,
          callback: ({ activePokemon }) => {
            // heal 10% of max hp
            battle.addToLog(
              `${activePokemon.name}'s Leftovers restores its health!`
            );
            const healAmount = Math.floor(activePokemon.maxHp * 0.1);
            activePokemon.giveHeal(healAmount, activePokemon, {
              type: "heldItem",
              id: this.id,
            });
          },
          conditionCallback: getIsActivePokemonCallback(battle, target),
        }),
      };
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
});

module.exports = {
  HeldItem,
  heldItemsToRegister,
};
