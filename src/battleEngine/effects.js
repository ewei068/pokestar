/* eslint-disable no-param-reassign */
const { effectTypes } = require("./battleConfig");
const { effectIdEnum } = require("../enums/battleEnums");

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
   */
  constructor({
    id,
    name,
    description,
    type,
    dispellable,
    effectAdd,
    effectRemove,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
    this.dispellable = dispellable;
    this.effectAdd = effectAdd;
    this.effectRemove = effectRemove;
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
        target.atk += Math.floor(target.batk * 0.5);
      }
    },
    effectRemove({ battle, target }) {
      battle.addToLog(`${target.name}'s Attack boost wore off!`);
      target.atk -= Math.floor(target.batk * 0.5);
    },
  }),
});

module.exports = {
  Effect,
  effectsToRegister,
};
