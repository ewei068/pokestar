const { logger } = require("../../log");

const allMoves = {};

/**
 * @param {{[K in MoveIdEnum]: Move}} moves
 */
const registerMoves = (moves) => {
  let movesRegistered = 0;
  Object.entries(moves).forEach(([moveId, move]) => {
    allMoves[moveId] = move;
    movesRegistered += 1;
  });
  logger.info(`Registered ${movesRegistered} moves.`);
};

/**
 * @param {{[K in MoveIdEnum]: object}} moveConfig
 * @param {{[K in MoveIdEnum]: Function}} moveExecutes
 */
const registerLegacyMoves = (moveConfig, moveExecutes) => {
  let movesRegistered = 0;
  Object.entries(moveConfig).forEach(([moveId, move]) => {
    if (allMoves[moveId]) {
      logger.warn(
        `Move ${moveId} ${allMoves[moveId].name} already exists. Continuing...`
      );
      return;
    }
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
    movesRegistered += 1;
  });
  logger.info(`Registered ${movesRegistered} legacy moves.`);
};

/**
 * @param {MoveIdEnum} moveId
 * @returns {Move}
 */
const getMove = (moveId) => allMoves[moveId];

/**
 * @param {object} param0
 * @param {Record<string, any>=} param0.fieldFilter
 * @param {Function=} param0.customFilter
 * @returns {PartialRecord<MoveIdEnum, Move>}
 */
const getMoves = ({ fieldFilter, customFilter }) => {
  if (customFilter) {
    return Object.entries(allMoves).reduce((acc, [moveId, move]) => {
      if (customFilter(move)) {
        acc[moveId] = move;
      }
      return acc;
    }, {});
  }

  if (fieldFilter) {
    return Object.entries(allMoves).reduce((acc, [moveId, move]) => {
      for (const [field, value] of Object.entries(fieldFilter)) {
        if (move[field] !== value) {
          return acc;
        }
      }
      acc[moveId] = move;
      return acc;
    }, {});
  }

  return {
    ...allMoves,
  };
};

/**
 * @param {object} param0
 * @param {Record<string, any>=} param0.fieldFilter
 * @param {Function=} param0.customFilter
 * @returns {Array<MoveIdEnum>}
 */
const getMoveIds = ({ fieldFilter, customFilter }) => {
  const moves = getMoves({ fieldFilter, customFilter });
  // @ts-ignore
  return Object.keys(moves);
};

module.exports = {
  registerMoves,
  registerLegacyMoves,
  getMove,
  getMoves,
  getMoveIds,
};
