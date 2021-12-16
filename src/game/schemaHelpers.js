/* eslint-disable camelcase */
import Logger from '../Logger';
import FEN from './FEN';
import Game from './Game';

const logger = new Logger('schemaHelpers');

const validateSchema_0_0_1 = ({ fen, pgn }) => {
  logger.trace('validate schema 0.0.1');
  try { FEN.load(fen, new Game()); } catch { return false; }
  if (!pgn) return false;
  if (!Array.isArray(pgn.white)) return false;
  if (!Array.isArray(pgn.black)) return false;
  const whiteMoveCount = pgn.white.length;
  const blackMoveCount = pgn.black.length;
  if (blackMoveCount > whiteMoveCount) return false;
  if (blackMoveCount < (whiteMoveCount - 1)) return false;
  return true;
};

const validateSchema_1_0_0 = ({ fen, pgn }) => {
  logger.trace('validate schema 1.0.0');
  try { FEN.load(fen, new Game()); } catch { return false; }
  if (!Array.isArray(pgn)) return false;
  if (pgn.some((move) => !move.white)) return false;
  const halfMoveCount = pgn.filter((move) => !move.black).length;
  if (halfMoveCount > 1) return false;
  if (halfMoveCount === 1) {
    const lastMove = pgn[pgn.length - 1];
    if (lastMove.black) return false;
  }
  return true;
};

const standardizeSchema_0_0_1 = (gameJson = {}) => {
  logger.trace('standardize schema 0.0.1');
  const isValid = validateSchema_0_0_1(gameJson);
  if (!isValid) {
    throw new Error('Invalid game json');
  }
  const pgn = gameJson.pgn.white.map((whiteMove, i) => ({
    white: whiteMove,
    black: gameJson.pgn.black[i],
  }));
  return { ...gameJson, pgn };
};

const standardizeSchema_1_0_0 = (gameJson = {}) => {
  logger.trace('standardize schema 1.0.0');
  const isValid = validateSchema_1_0_0(gameJson);
  if (!isValid) {
    throw new Error('Invalid game json');
  }
  return gameJson;
};

const standardizeGameJson = (gameJson = {}) => {
  logger.trace('standardizeGameJson');
  const { schema } = gameJson;
  switch (schema) {
    case '0.0.1':
      return standardizeSchema_0_0_1(gameJson);
    case '1.0.0':
      return standardizeSchema_1_0_0(gameJson);
    default:
      throw new Error('Invalid game json');
  }
};

export { standardizeGameJson };
