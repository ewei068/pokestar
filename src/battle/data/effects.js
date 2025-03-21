/* eslint-disable no-param-reassign */
const { effectTypes } = require("../../config/battleConfig");
const {
  effectIdEnum,
  battleEventEnum,
  moveIdEnum,
} = require("../../enums/battleEnums");
const { getIsTargetPokemonCallback } = require("../engine/eventConditions");
const { getEffect } = require("./effectRegistry");
const { getMove } = require("./moveRegistry");

/** @typedef {"hazard" | "test"} EffectTag */

/**
 * @template T
 * @template U
 */
class Effect {
  /**
   * @param {object} param0
   * @param {EffectIdEnum} param0.id
   * @param {string} param0.name
   * @param {string} param0.description
   * @param {EffectTypeEnum} param0.type
   * @param {boolean} param0.dispellable
   * @param {EffectAddCallback<T, U>} param0.effectAdd
   * @param {EffectRemoveCallback<T, U>} param0.effectRemove
   * @param {EffectTag[]=} param0.tags
   */
  constructor({
    id,
    name,
    description,
    type,
    dispellable,
    effectAdd,
    effectRemove,
    tags = [],
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.dispellable = dispellable;
    this.effectAdd = effectAdd;
    this.effectRemove = effectRemove;
    this.tags = [];
    this.isLegacyEffect = false;
  }
}

const effectsToRegister = Object.freeze({
  [effectIdEnum.ATK_UP]: new Effect({
    id: effectIdEnum.ATK_UP,
    name: "Atk. Up",
    description: "The target's Attack increased.",
    type: effectTypes.BUFF,
    dispellable: true,
    /**
     * @param {EffectAddBasicArgs & {initialArgs: any}} args
     */
    effectAdd({ battle, target }) {
      // if greaterAtkUp exists on target, remove atkUp and refresh greaterAtkUp
      const greaterAtkUpInstance = target.getEffectInstance("greaterAtkUp");
      const thisInstance = target.getEffectInstance(effectIdEnum.ATK_UP);
      if (greaterAtkUpInstance) {
        const currentDuration = thisInstance?.duration ?? 0;
        if (greaterAtkUpInstance.duration < currentDuration) {
          greaterAtkUpInstance.duration = currentDuration;
        }
        target.deleteEffectInstance(effectIdEnum.ATK_UP);
      } else {
        battle.addToLog(`${target.name}'s Attack rose!`);
        target.addStatMult("atk", 0.5);
      }
    },
    effectRemove({ battle, target }) {
      battle.addToLog(`${target.name}'s Attack boost wore off!`);
      target.addStatMult("atk", -0.5);
    },
  }),
  [effectIdEnum.SHIELD]: new Effect({
    id: effectIdEnum.SHIELD,
    name: "Shield",
    description: "The target's takes shielded damage.",
    type: effectTypes.BUFF,
    dispellable: true,
    /**
     * @param {EffectAddBasicArgs & {initialArgs: {shield: number}}} args
     * @returns {{shield?: number}}
     */
    effectAdd({ battle, target, initialArgs }) {
      const shield = initialArgs && initialArgs.shield;
      if (!shield) {
        return {};
      }

      const oldShield =
        target.getEffectInstance(effectIdEnum.SHIELD)?.args?.shield ?? 0;
      const newShield = Math.max(oldShield, shield);
      battle.addToLog(`${target.name} is shielded for ${newShield} damage!`);
      initialArgs.shield = newShield;
      return initialArgs;
    },
    effectRemove({ battle, target }) {
      battle.addToLog(`${target.name}'s shield was removed!`);
    },
  }),
  [effectIdEnum.DEBUFF_IMMUNITY]: new Effect({
    id: effectIdEnum.DEBUFF_IMMUNITY,
    name: "Debuff Immunity",
    description: "The target is immune to debuffs.",
    type: effectTypes.BUFF,
    dispellable: true,
    /**
     * @param {EffectAddBasicArgs & {initialArgs: any}} args
     */
    effectAdd({ battle, target }) {
      battle.addToLog(`${target.name} is immune to debuffs!`);
      return {
        listenerId: battle.registerListenerFunction({
          eventName: battleEventEnum.BEFORE_EFFECT_ADD,
          callback: (eventArgs) => {
            const effect = getEffect(eventArgs.effectId);
            if (effect.type !== effectTypes.DEBUFF || effect.dispellable) {
              return;
            }

            eventArgs.canAdd = false;
            battle.addToLog(
              `${target.name} is immune to debuffs and cannot be affected by ${effect.name}!`
            );
          },
          conditionCallback: getIsTargetPokemonCallback(target),
        }),
      };
    },
    effectRemove({ battle, target, properties }) {
      battle.addToLog(`${target.name} is no longer immune to debuffs!`);
      battle.unregisterListener(properties.listenerId);
    },
  }),
  [effectIdEnum.AQUA_BLESSING]: new Effect({
    id: effectIdEnum.AQUA_BLESSING,
    name: "Aqua Blessing",
    description: "The target's stat is increased by 2x (+).",
    type: effectTypes.BUFF,
    dispellable: true,
    /**
     * @param {EffectAddBasicArgs & {initialArgs: {statId: StatIdNoHP}}} args
     */
    effectAdd({ battle, target, initialArgs }) {
      const { statId } = initialArgs;
      battle.addToLog(`${target.name}'s ${statId} rose!`);
      target.addStatMult(statId, 1);
      return {};
    },
    effectRemove({ battle, target, initialArgs }) {
      const { statId } = initialArgs;
      battle.addToLog(`${target.name}'s ${statId} boost wore off!`);
      target.addStatMult(statId, -1);
    },
  }),
  [effectIdEnum.DOOM_DESIRE]: new Effect({
    id: effectIdEnum.DOOM_DESIRE,
    name: "Doom Desire",
    description: "The target will take damage when the effect is removed.",
    type: effectTypes.DEBUFF,
    dispellable: false,
    /**
     * @param {EffectAddBasicArgs & {initialArgs: any}} args
     */
    effectAdd({ battle, target, source }) {
      battle.addToLog(
        `${source.name} is foreseeing an attack against ${target.name}!`
      );
      return {};
    },
    effectRemove({ battle, target, source }) {
      battle.addToLog(
        `${target.name} was hit by ${source.name}'s Doom Desire!`
      );
      const damageToDeal = source.calculateMoveDamage({
        move: getMove(moveIdEnum.DOOM_DESIRE),
        target,
        primaryTarget: target,
        allTargets: [target],
        offTargetDamageMultiplier: 1,
        backTargetDamageMultiplier: 1,
      });
      source.dealDamage(damageToDeal, target, {
        type: "move",
        moveId: moveIdEnum.DOOM_DESIRE,
      });
    },
  }),
});

module.exports = {
  Effect,
  effectsToRegister,
};
