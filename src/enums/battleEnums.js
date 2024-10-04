const types = require("../../types");

/**
 * @typedef{import("../battleEngine/battleConfig").LegacyMoveIdEnum} LegacyMoveIdEnum
 * @typedef{types.Enum<moveIdEnum>} NewMoveIdEnum
 * @typedef{LegacyMoveIdEnum | NewMoveIdEnum} MoveIdEnum
 */

const moveIdEnum = Object.freeze({
  VINE_WHIP: "m22",
  TEST_MOVE: "999",
  TEST_MOVE2: "998",
});

module.exports = {
  moveIdEnum,
};
