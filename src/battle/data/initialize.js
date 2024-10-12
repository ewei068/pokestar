// @ts-nocheck
// TODO: remove ts-nocheck when all moves, effects, abilities, and events are migrated
const { registerMoves, registerLegacyMoves } = require("./moveService");
const { registerEffects, registerLegacyEffects } = require("./effectRegistry");
const { effectsToRegister } = require("./effects");
const {
  moveConfig,
  moveExecutes,
  effectConfig,
  abilityConfig,
} = require("../../config/battleConfig");
const { movesToRegister } = require("./moves");
const {
  registerAbilities,
  registerLegacyAbilities,
} = require("./abilityRegistry");
const { abilitiesToRegister } = require("./abilities");

const initialize = () => {
  registerEffects(effectsToRegister);
  registerLegacyEffects(effectConfig);
  registerMoves(movesToRegister);
  registerLegacyMoves(moveConfig, moveExecutes);
  registerAbilities(abilitiesToRegister);
  registerLegacyAbilities(abilityConfig);
};

module.exports = {
  initialize,
};
