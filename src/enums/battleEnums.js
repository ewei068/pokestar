const types = require("../../types");

/**
 * @typedef {import("../battleEngine/battleConfig").LegacyEffectIdEnum} LegacyEffectIdEnum
 * @typedef {types.Enum<effectIdEnum>} NewEffectIdEnum
 * @typedef {LegacyEffectIdEnum | NewEffectIdEnum} EffectIdEnum
 */

const effectIdEnum = Object.freeze({
  TEST_EFFECT: "testEffect",
  ATK_UP: "atkUp",
  SHIELD: "shield",
});

/**
 * @typedef {import("../battleEngine/battleConfig").LegacyMoveIdEnum} LegacyMoveIdEnum
 * @typedef {types.Enum<moveIdEnum>} NewMoveIdEnum
 * @typedef {LegacyMoveIdEnum | NewMoveIdEnum} MoveIdEnum
 */

const moveIdEnum = Object.freeze({
  TEST_MOVE: "999",
  TEST_MOVE2: "998",
  VINE_WHIP: "m22",
});

module.exports = {
  moveIdEnum,
  effectIdEnum,
};
