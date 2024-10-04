const { logger } = require("../log");
const types = require("../../types");

/**
 * @typedef{import("./battleConfig").LegacyMoveIdEnum} LegacyMoveIdEnum
 * @typedef{types.Enum<moveIds>} NewMoveIdEnum
 * @typedef{LegacyMoveIdEnum | NewMoveIdEnum} MoveIdEnum
 */

const moveIds = Object.freeze({
  TEST_MOVE: "999",
  TEST_MOVE2: "998",
});

const allMoves = {};

/**
 * @param {Array<Move>} moves
 */
const registerMoves = (moves) => {
  moves.forEach((move) => {
    allMoves[move.id] = move;
  });
};

/**
 * @param {Object<MoveIdEnum, Object>} moveConfig
 * @param {Object<MoveIdEnum, Function>} moveExecutes
 */
const registerLegacyMoves = (moveConfig, moveExecutes) => {
  Object.entries(moveConfig).forEach(([moveId, move]) => {
    const moveExecute = moveExecutes[moveId];
    if (!moveExecute) {
      logger.warn(
        `Move ${moveId} ${move.name} has no execute function. Proceeding without it.`
      );
      return;
    }
    allMoves[moveId] = {
      ...move,
      execute: moveExecutes[moveId],
      isLegacyMove: true,
    };
  });
};

/**
 * @param {MoveIdEnum} moveId
 * @returns {Move}
 */
const getMove = (moveId) => {
  return allMoves[moveId];
};

/**
 * @param {Object} param0
 * @param {MoveIdEnum} param0.moveId
 * @param {Object} param0.battle
 * @param {Object} param0.source
 * @param {Object} param0.primaryTarget
 * @param {Array<Object>} param0.allTargets
 * @param {Array<Object>?=} param0.missedTargets
 * @returns
 */
const executeMove = ({
  moveId,
  battle,
  source,
  primaryTarget,
  allTargets,
  missedTargets = [],
}) => {
  const move = getMove(moveId);
  if (!move) {
    logger.error(`Move ${moveId} not found.`);
    return;
  }

  if (!move.isLegacyMove) {
    move.execute({
      battle,
      source,
      primaryTarget,
      allTargets,
      missedTargets,
    });
  } else {
    const legacyMove = /** @type{any} */ (move);
    legacyMove.execute(
      battle,
      source,
      primaryTarget,
      allTargets,
      missedTargets
    );
  }
};

module.exports = {
  registerMoves,
  registerLegacyMoves,
  getMove,
  executeMove,
};
