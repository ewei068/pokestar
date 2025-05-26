/* eslint-disable no-param-reassign */
const { backpackHeldItemConfig } = require("../../config/backpackConfig");
const {
  moveTiers,
  statusConditions,
  targetPatterns,
} = require("../../config/battleConfig");
const { pokemonConfig } = require("../../config/pokemonConfig");
const {
  battleEventEnum,
  heldItemIdEnum,
  effectIdEnum,
} = require("../../enums/battleEnums");
const { logger } = require("../../log");
const {
  getMoveIdHasTag,
  getEffectIdHasTag,
} = require("../../utils/battleUtils");
const { getSpeciesIdHasTag } = require("../../utils/pokemonUtils");
const {
  getIsActivePokemonCallback,
  getIsTargetPokemonCallback,
  getIsSourcePokemonCallback,
  composeConditionCallbacks,
  getIsInstanceOfType,
} = require("../engine/eventConditions");
const { getMove } = require("./moveRegistry");

/**
 * @typedef {"berry" | "usable"} HeldItemTag
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
   * @param {HeldItemUseCallback<T>=} param0.itemUse
   * @param {HeldItemTag[]?=} param0.tags
   */
  constructor({ id, itemAdd, itemRemove, itemUse, tags = [] }) {
    this.id = id;
    const itemData = backpackHeldItemConfig[id];
    this.name = itemData.name;
    this.description = itemData.description;
    this.itemAdd = itemAdd;
    this.itemRemove = itemRemove;
    this.isLegacyAbility = false;
    this.itemUse =
      itemUse ||
      (() => {
        logger.error(`${this?.name} does not have an itemUse function.`);
      });
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
   * @param {(args: Parameters<BattleEventListenerCallback<K>>[0] & { heldItemInstance: { heldItemId: HeldItemIdEnum, data: any, applied: boolean } }) => ReturnType<BattleEventListenerCallback<K>>} param0.callback
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
        return callback(args);
      },
      conditionCallback,
    });
  }

  /**
   * @param {object} args
   * @param {Battle} args.battle
   * @param {BattlePokemon} args.target
   * @param {(target: BattlePokemon) => void} applyBuffCallback
   */
  applyChoiceItemWithBuff(args, applyBuffCallback) {
    const { battle, target } = args;
    applyBuffCallback(target);
    return {
      currentMoveId: null,
      disabledMoveIds: [],
      moveListenerId: this.registerListenerFunction({
        battle,
        target,
        eventName: battleEventEnum.AFTER_MOVE,
        callback: ({ moveId, heldItemInstance }) => {
          const { tier } = getMove(moveId) || {};
          const heldItemData = heldItemInstance.data;
          if (tier === moveTiers.BASIC) {
            // re-enabled all disabled moves and reset the disabled moves
            for (const disabledMoveId of heldItemData.disabledMoveIds) {
              target.enableMove(disabledMoveId, target);
            }
            heldItemData.disabledMoveIds = [];
            heldItemData.currentMoveId = moveId;
          } else {
            // disable non basic moves
            for (const moveIdToDisable of target.getMoveIds()) {
              if (
                getMove(moveIdToDisable).tier === moveTiers.BASIC ||
                heldItemData.disabledMoveIds.includes(moveIdToDisable) ||
                moveIdToDisable === moveId
              ) {
                continue;
              }

              target.disableMove(moveIdToDisable, target);
              heldItemData.disabledMoveIds.push(moveIdToDisable);
              heldItemData.currentMoveId = moveId;
            }
          }
        },
        conditionCallback: getIsSourcePokemonCallback(target),
      }),
      skipTurnListenerId: this.registerListenerFunction({
        battle,
        target,
        eventName: battleEventEnum.AFTER_SKIP_TURN,
        callback: ({ heldItemInstance }) => {
          heldItemInstance.data.currentMoveId = null;
          for (const moveId of heldItemInstance.data.disabledMoveIds) {
            target.enableMove(moveId, target);
          }
          heldItemInstance.data.disabledMoveIds = [];
        },
        conditionCallback: getIsSourcePokemonCallback(target),
      }),
    };
  }

  /**
   * @param {object} args
   * @param {Battle} args.battle
   * @param {BattlePokemon} args.target
   * @param {{ moveListenerId: string, skipTurnListenerId: string, currentMoveId: MoveIdEnum, disabledMoveIds: MoveIdEnum[] }} args.properties
   * @param  {(target: BattlePokemon) => void} removeBuffCallback
   */
  // eslint-disable-next-line class-methods-use-this
  removeChoiceItemWithBuff(args, removeBuffCallback) {
    const { battle, target, properties } = args;
    removeBuffCallback(target);
    battle.unregisterListener(properties.moveListenerId);
    battle.unregisterListener(properties.skipTurnListenerId);
    // re-enable all disabled moves
    for (const moveId of properties.disabledMoveIds) {
      target.enableMove(moveId, target);
    }
  }
}

/**
 * @param {PokemonIdEnum} speciesId
 */
const shouldApplyEviolite = (speciesId) => {
  const speciesData = pokemonConfig[speciesId];
  return speciesData?.evolution || getSpeciesIdHasTag(speciesId, "eviolite");
};

const heldItemsToRegister = Object.freeze({
  [heldItemIdEnum.LUM_BERRY]: new HeldItem({
    id: heldItemIdEnum.LUM_BERRY,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_STATUS_APPLY,
          callback: () => {
            target.useHeldItem(target);
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
      };
    },
    itemUse({ battle, target }) {
      battle.addToLog(`${target.name}'s Lum Berry cured its status condition!`);
      target.removeStatus();
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
    tags: ["berry", "usable"],
  }),
  [heldItemIdEnum.SITRUS_BERRY]: new HeldItem({
    id: heldItemIdEnum.SITRUS_BERRY,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_DAMAGE_TAKEN,
          callback: () => {
            if (target.hp / target.maxHp <= 0.5) {
              target.useHeldItem(target);
            }
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
      };
    },
    itemUse({ battle, target }) {
      // heal 50% of max hp
      battle.addToLog(`${target.name}'s Sitrus Berry restores its health!`);
      const healAmount = Math.floor(target.maxHp * 0.5);
      target.giveHeal(healAmount, target, {
        type: "heldItem",
        id: this.id,
      });
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
    tags: ["berry", "usable"],
  }),
  [heldItemIdEnum.EXP_SHARE]: new HeldItem({
    id: heldItemIdEnum.EXP_SHARE,
    // special item; logic coded into battle engine
    itemAdd() {},
    itemRemove() {},
  }),
  [heldItemIdEnum.CHOICE_BAND]: new HeldItem({
    id: heldItemIdEnum.CHOICE_BAND,
    itemAdd(args) {
      return this.applyChoiceItemWithBuff(args, (target) => {
        target.multiplyStatMult("atk", 1.5);
      });
    },
    itemRemove(args) {
      this.removeChoiceItemWithBuff(args, (target) => {
        target.multiplyStatMult("atk", 1 / 1.5);
      });
    },
  }),
  [heldItemIdEnum.AMULET_COIN]: new HeldItem({
    id: heldItemIdEnum.AMULET_COIN,
    // special item; logic coded into battle engine
    itemAdd() {},
    itemRemove() {},
  }),
  [heldItemIdEnum.FOCUS_BAND]: new HeldItem({
    id: heldItemIdEnum.FOCUS_BAND,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_TAKEN,
          callback: ({ damage, maxDamage }) => {
            const damageWillTake = Math.min(damage, maxDamage);
            if (damageWillTake > target.hp) {
              target.battle.addToLog(`${target.name} hung on with Focus Band!`);
              target.applyEffect(effectIdEnum.SHIELD, 1, target, {
                shield: 1,
              });
              target.removeHeldItem();
              return {
                damage: target.hp - 1,
                maxDamage: Math.min(maxDamage, target.hp - 1),
              };
            }
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
      };
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [heldItemIdEnum.LUCKY_EGG]: new HeldItem({
    id: heldItemIdEnum.LUCKY_EGG,
    // special item; logic coded into battle engine
    itemAdd() {},
    itemRemove() {},
  }),
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
  [heldItemIdEnum.WIDE_LENS]: new HeldItem({
    id: heldItemIdEnum.WIDE_LENS,
    itemAdd({ target }) {
      target.acc += 10;
    },
    itemRemove({ target }) {
      target.acc -= 10;
    },
  }),
  [heldItemIdEnum.LIFE_ORB]: new HeldItem({
    id: heldItemIdEnum.LIFE_ORB,
    itemAdd({ battle, target }) {
      return {
        selfDamageListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_MOVE,
          callback: ({ source, moveId }) => {
            const moveData = getMove(moveId);
            const power = moveData?.power || 0;
            if (power > 0) {
              // damage user by 10% of max hp
              const damageAmount = Math.max(1, Math.floor(target.maxHp * 0.1));
              battle.addToLog(`${source.name} is damaged by its Life Orb!`);
              source.takeDamage(damageAmount, target, {
                type: "heldItem",
                id: this.id,
              });
            }
          },
          conditionCallback: getIsSourcePokemonCallback(target),
        }),
        damageBoostListenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_DEALT,
          callback: ({ damage, damageInfo }) => {
            const moveData = getMove(damageInfo.moveId || damageInfo.id);
            const power = moveData?.power || 0;
            if (power > 0) {
              return {
                damage: Math.floor(damage * 1.3),
              };
            }
          },
          conditionCallback: composeConditionCallbacks(
            getIsInstanceOfType("move"),
            getIsSourcePokemonCallback(target)
          ),
        }),
      };
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.selfDamageListenerId);
    },
  }),
  [heldItemIdEnum.POWER_HERB]: new HeldItem({
    id: heldItemIdEnum.POWER_HERB,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_MOVE_EXECUTE,
          callback: ({ moveId, source }) => {
            const { chargeMoveEffectId } = getMove(moveId);
            if (!getMoveIdHasTag(moveId, "charge") || !chargeMoveEffectId) {
              return;
            }

            source.applyEffect(chargeMoveEffectId, 1, source, {});
            battle.addToLog(`${source.name} used its Power Herb!`);
            source.removeHeldItem();
          },
          conditionCallback: getIsSourcePokemonCallback(target),
        }),
      };
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [heldItemIdEnum.FOCUS_SASH]: new HeldItem({
    id: heldItemIdEnum.FOCUS_SASH,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_TAKEN,
          callback: ({ damage, maxDamage }) => {
            // if fatal damage from full hp, set hp to 1
            const damageWillTake = Math.min(damage, maxDamage);
            if (damageWillTake > target.hp && target.hp >= target.maxHp) {
              target.battle.addToLog(`${target.name} hung on with Sturdy!`);
              target.applyEffect("moveInvulnerable", 1, target, {});
              target.removeHeldItem();
              return {
                damage: target.hp - 1,
                maxDamage: Math.min(maxDamage, target.hp - 1),
              };
            }
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
      };
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [heldItemIdEnum.CHOICE_SCARF]: new HeldItem({
    id: heldItemIdEnum.CHOICE_SCARF,
    itemAdd(args) {
      return this.applyChoiceItemWithBuff(args, (target) => {
        target.addFlatStatBoost("spe", 100);
      });
    },
    itemRemove(args) {
      this.removeChoiceItemWithBuff(args, (target) => {
        target.addFlatStatBoost("spe", -100);
      });
    },
  }),
  [heldItemIdEnum.CHOICE_SPECS]: new HeldItem({
    id: heldItemIdEnum.CHOICE_SPECS,
    itemAdd(args) {
      return this.applyChoiceItemWithBuff(args, (target) => {
        target.multiplyStatMult("spa", 1.5);
      });
    },
    itemRemove(args) {
      this.removeChoiceItemWithBuff(args, (target) => {
        target.multiplyStatMult("spa", 1 / 1.5);
      });
    },
  }),
  [heldItemIdEnum.EVIOLITE]: new HeldItem({
    id: heldItemIdEnum.EVIOLITE,
    itemAdd({ battle, target }) {
      if (shouldApplyEviolite(target.speciesId)) {
        target.multiplyStatMult("def", 1.5);
        target.multiplyStatMult("spd", 1.5);
      }
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_TRANSFORM,
          callback: ({ beforeSpeciesId, afterSpeciesId }) => {
            if (
              shouldApplyEviolite(beforeSpeciesId) &&
              !shouldApplyEviolite(afterSpeciesId)
            ) {
              target.multiplyStatMult("def", 1 / 1.5);
              target.multiplyStatMult("spd", 1 / 1.5);
            } else if (
              !shouldApplyEviolite(beforeSpeciesId) &&
              shouldApplyEviolite(afterSpeciesId)
            ) {
              target.multiplyStatMult("def", 1.5);
              target.multiplyStatMult("spd", 1.5);
            }
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
      };
    },
    itemRemove({ battle, target, properties }) {
      battle.unregisterListener(properties.listenerId);
      if (shouldApplyEviolite(target.speciesId)) {
        target.multiplyStatMult("def", 1 / 1.5);
        target.multiplyStatMult("spd", 1 / 1.5);
      }
    },
  }),
  [heldItemIdEnum.HEAVY_DUTY_BOOTS]: new HeldItem({
    id: heldItemIdEnum.HEAVY_DUTY_BOOTS,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.BEFORE_DAMAGE_TAKEN,
          callback: ({ damageInfo }) => {
            const effectId = damageInfo?.id;
            if (getEffectIdHasTag(effectId, "hazard")) {
              return {
                damage: 0,
                maxDamage: 0,
              };
            }
          },
          conditionCallback: composeConditionCallbacks(
            getIsInstanceOfType("effect"),
            getIsTargetPokemonCallback(target)
          ),
        }),
      };
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [heldItemIdEnum.TOXIC_ORB]: new HeldItem({
    id: heldItemIdEnum.TOXIC_ORB,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.TURN_END,
          callback: ({ activePokemon }) => {
            if (!activePokemon.status.statusId) {
              battle.addToLog(`${activePokemon.name}'s Toxic Orb activates!`);
              activePokemon.applyStatus(
                statusConditions.BADLY_POISON,
                activePokemon
              );
            }
          },
          conditionCallback: getIsActivePokemonCallback(battle, target),
        }),
      };
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [heldItemIdEnum.FLAME_ORB]: new HeldItem({
    id: heldItemIdEnum.FLAME_ORB,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.TURN_END,
          callback: ({ activePokemon }) => {
            if (!activePokemon.status.statusId) {
              battle.addToLog(`${activePokemon.name}'s Flame Orb activates!`);
              activePokemon.applyStatus(statusConditions.BURN, activePokemon);
            }
          },
          conditionCallback: getIsActivePokemonCallback(battle, target),
        }),
      };
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [heldItemIdEnum.EJECT_BUTTON]: new HeldItem({
    id: heldItemIdEnum.EJECT_BUTTON,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_DAMAGE_TAKEN,
          callback: ({ target: damagedPokemon }) => {
            damagedPokemon.useHeldItem(damagedPokemon);
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
      };
    },
    itemUse({ battle, target }) {
      battle.addToLog(`${target.name}'s Eject Button was triggered!`);
      const allyParty = battle.parties[target.teamName];
      const adjacentAllies = target.getPatternTargets(
        allyParty,
        targetPatterns.CROSS,
        target.position,
        { ignoreHittable: true }
      );
      const allies = adjacentAllies.filter(
        (pokemon) => pokemon !== target && !pokemon.isFainted
      );

      if (allies.length > 0) {
        let lowestCRAlly = allies[0];
        for (const ally of allies) {
          if (ally.combatReadiness < lowestCRAlly.combatReadiness) {
            lowestCRAlly = ally;
          }
        }
        lowestCRAlly.boostCombatReadiness(target, 100);
      } else {
        battle.addToLog(`But there were no adjacent allies!`);
      }
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
    tags: ["usable"],
  }),
  [heldItemIdEnum.ROCKY_HELMET]: new HeldItem({
    id: heldItemIdEnum.ROCKY_HELMET,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_DAMAGE_TAKEN,
          callback: ({ source }) => {
            const damage = Math.max(1, Math.floor(source.maxHp * 0.05));
            battle.addToLog(
              `${source.name} was hurt by ${target.name}'s Rocky Helmet!`
            );
            target.dealDamage(damage, source, {
              type: "heldItem",
              id: this.id,
            });
          },
          conditionCallback: composeConditionCallbacks(
            getIsInstanceOfType("move"),
            getIsTargetPokemonCallback(target)
          ),
        }),
      };
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [heldItemIdEnum.CUSTAP_BERRY]: new HeldItem({
    id: heldItemIdEnum.CUSTAP_BERRY,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_DAMAGE_TAKEN,
          callback: () => {
            if (target.hp / target.maxHp <= 0.3) {
              target.useHeldItem(target);
            }
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
      };
    },
    itemUse({ battle, target }) {
      battle.addToLog(`${target.name}'s Custap Berry activated!`);
      target.boostCombatReadiness(target, 100);
    },
    itemRemove({ battle, properties }) {
      battle.unregisterListener(properties.listenerId);
    },
    tags: ["berry", "usable"],
  }),
  [heldItemIdEnum.SHELL_BELL]: new HeldItem({
    id: heldItemIdEnum.SHELL_BELL,
    itemAdd({ battle, target }) {
      return {
        listenerId: this.registerListenerFunction({
          battle,
          target,
          eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
          callback: ({ damage, damageInfo }) => {
            if (damageInfo?.type === "move") {
              const healAmount = Math.max(1, Math.floor(damage * 0.1));
              battle.addToLog(`${target.name}'s Shell Bell restored its HP!`);
              target.giveHeal(healAmount, target, {
                type: "heldItem",
                id: this.id,
              });
            }
          },
          conditionCallback: getIsSourcePokemonCallback(target),
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
