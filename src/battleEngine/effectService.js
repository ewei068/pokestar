const { logger } = require("../log");

const allEffects = {};

/**
 * @param {Record<EffectIdEnum, Effect<any, any>>} effects
 */
const registerEffects = (effects) => {
  Object.entries(effects).forEach(([effectId, effect]) => {
    allEffects[effectId] = effect;
  });
};

/**
 * @param {Record<EffectIdEnum, object>} effectConfig
 */
const registerLegacyEffects = (effectConfig) => {
  Object.entries(effectConfig).forEach(([effectId, effect]) => {
    allEffects[effectId] = {
      ...effect,
      isLegacyEffect: true,
    };
  });
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
 */
const applyEffect = ({ effectId, battle, source, target, initialArgs }) => {
  const effect = getEffect(effectId);
  if (!effect) {
    logger.error(`Effect ${effectId} does not exist.`);
    return;
  }
  if (!effect.isLegacyEffect) {
    effect.effectAdd({
      battle,
      source,
      target,
      initialArgs,
    });
  } else {
    const legacyEffect = /** @type {any} */ (effect);
    legacyEffect.effectAdd(battle, source, target, initialArgs);
  }
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
