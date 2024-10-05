// eslint-disable-next-line no-unused-vars
const { effectIdEnum } = require("../enums/battleEnums"); // TODO: remove after testing
const { logger } = require("../log");

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
 * @template {EffectIdEnum} K
 * @param {object} param0
 * @param {K} param0.effectId
 * @param {Battle} param0.battle
 * @param {BattlePokemon} param0.source
 * @param {BattlePokemon} param0.target
 * @param {EffectInitialArgsTypeFromId<K>} param0.initialArgs
 * @returns {EffectPropertiesTypeFromId<K> | undefined}
 */
const applyEffect = ({ effectId, battle, source, target, initialArgs }) => {
  const effect = getEffect(effectId);
  if (!effect) {
    logger.error(`Effect ${effectId} does not exist.`);
    return;
  }
  if (!effect.isLegacyEffect) {
    return effect.effectAdd({
      battle,
      source,
      target,
      initialArgs,
    });
  }
  const legacyEffect = /** @type {any} */ (effect);
  return legacyEffect.effectAdd(battle, source, target, initialArgs);
};

/**
 * @template {EffectIdEnum} K
 * @param {object} param0
 * @param {K} param0.effectId
 * @param {Battle} param0.battle
 * @param {BattlePokemon} param0.target
 * @param {EffectInitialArgsTypeFromId<K>} param0.initialArgs
 * @param {EffectPropertiesTypeFromId<K>} param0.properties
 */
const removeEffect = ({
  effectId,
  battle,
  target,
  initialArgs,
  properties,
}) => {
  const effect = getEffect(effectId);
  if (!effect) {
    logger.error(`Effect ${effectId} does not exist.`);
    return;
  }
  if (!effect.isLegacyEffect) {
    // @ts-ignore
    effect.effectRemove({
      battle,
      target,
      initialArgs,
      properties,
    });
  } else {
    const legacyEffect = /** @type {any} */ (effect);
    legacyEffect.effectRemove(battle, target, properties, initialArgs);
  }
};

module.exports = {
  registerEffects,
  registerLegacyEffects,
  getEffect,
  applyEffect,
  removeEffect,
};