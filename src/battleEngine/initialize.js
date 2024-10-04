const { registerMoves, registerLegacyMoves } = require("./moveService");
const { moveConfig, moveExecutes } = require("./battleConfig");
const { movesToRegister } = require("./moves");

const initialize = () => {
  registerMoves(movesToRegister);
  registerLegacyMoves(moveConfig, moveExecutes);
};

module.exports = {
  initialize,
};
