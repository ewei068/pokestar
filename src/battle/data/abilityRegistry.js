// eslint-disable-next-line no-unused-vars
const { abilityIdEnum } = require("../../enums/battleEnums"); // TODO: remove after testing
const { logger } = require("../../log");

const allAbilities = {};

/**
 * @param {Record<AbilityIdEnum, Ability<any>>} abilities
 * @param {boolean=} silent
 */
const registerAbilities = (abilities, silent = false) => {
  let abilitiesRegistered = 0;
  Object.entries(abilities).forEach(([abilityId, ability]) => {
    allAbilities[abilityId] = ability;
    abilitiesRegistered += 1;
  });
  if (!silent) {
    logger.info(`Registered ${abilitiesRegistered} abilities.`);
  }
};

/**
 * @param {Record<AbilityIdEnum, object>} abilityConfig
 * @param {boolean=} silent
 */
const registerLegacyAbilities = (abilityConfig, silent = false) => {
  let abilitiesRegistered = 0;
  Object.entries(abilityConfig).forEach(([abilityId, ability]) => {
    if (allAbilities[abilityId]) {
      logger.warn(
        `Ability ${abilityId} ${allAbilities[abilityId].name} already exists. Continuing...`,
      );
      return;
    }
    allAbilities[abilityId] = {
      ...ability,
      isLegacyAbility: true,
    };
    abilitiesRegistered += 1;
  });
  if (!silent) {
    logger.info(`Registered ${abilitiesRegistered} legacy abilities.`);
  }
};

/**
 * @template {AbilityIdEnum} K
 * @param {K} abilityId
 * @returns {K extends keyof RegisteredAbilities ? RegisteredAbilities[K] : Ability<any>?}
 */
const getAbility = (abilityId) =>
  // @ts-ignore
  allAbilities[abilityId];

/**
 * @param {object} param0
 * @param {Record<string, any>=} param0.fieldFilter
 * @param {Function=} param0.customFilter
 * @returns {PartialRecord<AbilityIdEnum, Ability<any>>}
 */
const getAbilities = ({ fieldFilter, customFilter }) => {
  if (customFilter) {
    return Object.entries(allAbilities).reduce((acc, [abilityId, ability]) => {
      if (customFilter(ability)) {
        acc[abilityId] = ability;
      }
      return acc;
    }, {});
  }

  if (fieldFilter) {
    return Object.entries(allAbilities).reduce((acc, [abilityId, ability]) => {
      for (const [field, value] of Object.entries(fieldFilter)) {
        if (ability[field] !== value) {
          return acc;
        }
      }
      acc[abilityId] = ability;
      return acc;
    }, {});
  }

  return {
    ...allAbilities,
  };
};

/**
 * @param {object} param0
 * @param {Record<string, any>=} param0.fieldFilter
 * @param {Function=} param0.customFilter
 * @returns {AbilityIdEnum[]}
 */
const getAbilityIds = ({ fieldFilter, customFilter }) => {
  const abilities = getAbilities({ fieldFilter, customFilter });
  // @ts-ignore
  return Object.keys(abilities);
};

module.exports = {
  registerAbilities,
  registerLegacyAbilities,
  getAbility,
  getAbilities,
  getAbilityIds,
};
