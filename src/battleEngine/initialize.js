// @ts-nocheck
// TODO: remove ts-nocheck when all moves, effects, abilities, and events are migrated
const { registerMoves, registerLegacyMoves } = require("./moveService");
const { registerEffects, registerLegacyEffects } = require("./effectService");
const { effectsToRegister } = require("./effects");
const { moveConfig, moveExecutes, effectConfig } = require("./battleConfig");
const { movesToRegister } = require("./moves");

const initialize = () => {
  registerEffects(effectsToRegister);
  registerLegacyEffects(effectConfig);
  registerMoves(movesToRegister);
  registerLegacyMoves(moveConfig, moveExecutes);
};

module.exports = {
  initialize,
};
