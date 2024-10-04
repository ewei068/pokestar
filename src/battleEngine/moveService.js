const { logger } = require("../log");

const allMoves = {};

/**
 * @param {{[K in MoveIdEnum]: Move}} moves
 */
const registerMoves = (moves) => {
  Object.entries(moves).forEach(([moveId, move]) => {
    allMoves[moveId] = move;
  });
};

/**
 * @param {{[K in MoveIdEnum]: Object}} moveConfig
 * @param {{[K in MoveIdEnum]: Function}} moveExecutes
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
 * @param {Array<Object>=} param0.missedTargets
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
