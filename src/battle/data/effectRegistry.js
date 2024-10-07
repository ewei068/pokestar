// eslint-disable-next-line no-unused-vars
const { effectIdEnum } = require("../../enums/battleEnums"); // TODO: remove after testing
const { logger } = require("../../log");
const types = require("../../../types");

const allEffects = {};

/**
 * @param {Record<EffectIdEnum, Effect<any, any>>} effects
 */
const registerEffects = (effects) => {
  let effectsRegistered = 0;
  Object.entries(effects).forEach(([effectId, effect]) => {
    allEffects[effectId] = effect;
    effectsRegistered += 1;
  });
  logger.info(`Registered ${effectsRegistered} effects.`);
};

/**
 * @param {Record<EffectIdEnum, object>} effectConfig
 */
const registerLegacyEffects = (effectConfig) => {
  let effectsRegistered = 0;
  Object.entries(effectConfig).forEach(([effectId, effect]) => {
    if (allEffects[effectId]) {
      logger.warn(
        `Effect ${effectId} ${allEffects[effectId].name} already exists. Continuing...`
      );
      return;
    }
    allEffects[effectId] = {
      ...effect,
      isLegacyEffect: true,
    };
    effectsRegistered += 1;
  });
  logger.info(`Registered ${effectsRegistered} legacy effects.`);
};

/**
 * @template {EffectIdEnum} K
 * @param {K} effectId
 * @returns {K extends keyof RegisteredEffects ? RegisteredEffects[K] : Effect<any, any>}
 */
const getEffect = (effectId) =>
  // @ts-ignore
  allEffects[effectId];

/**
 * @param {Object} param0
 * @param {Record<string, any>=} param0.fieldFilter
 * @param {Function=} param0.customFilter
 * @returns {types.PartialRecord<EffectIdEnum, Effect<any, any>>}
 */
const getEffects = ({ fieldFilter, customFilter }) => {
  if (customFilter) {
    return Object.entries(allEffects).reduce((acc, [effectId, effect]) => {
      if (customFilter(effect)) {
        acc[effectId] = effect;
      }
      return acc;
    }, {});
  }

  if (fieldFilter) {
    return Object.entries(allEffects).reduce((acc, [effectId, effect]) => {
      for (const [field, value] of Object.entries(fieldFilter)) {
        if (effect[field] !== value) {
          return acc;
        }
      }
      acc[effectId] = effect;
      return acc;
    }, {});
  }

  return {
    ...allEffects,
  };
};
/**
 * @param {Object} param0
 * @param {Record<string, any>=} param0.fieldFilter
 * @param {Function=} param0.customFilter
 * @returns {EffectIdEnum[]}
 */
const getEffectIds = ({ fieldFilter, customFilter }) => {
  const effects = getEffects({ fieldFilter, customFilter });
  // @ts-ignore
  return Object.keys(effects);
};

module.exports = {
  registerEffects,
  registerLegacyEffects,
  getEffect,
  getEffects,
  getEffectIds,
};
