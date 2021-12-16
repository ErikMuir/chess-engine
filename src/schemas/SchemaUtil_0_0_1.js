/* eslint-disable camelcase */
import Logger from '../Logger';
import ISchemaUtil from './ISchemaUtil';
import FEN from '../game/FEN';
import Game from '../game/Game';

const logger = new Logger('SchemaUtil_0_0_1');

/**
 * SchemaUtil_0_0_1
 *
 * @class SchemaUtil_0_0_1
 * @extends {ISchemaUtil}
 */
class SchemaUtil_0_0_1 extends ISchemaUtil {
  static isValid({ fen, pgn }) {
    logger.trace('isValid');
    try { FEN.load(fen, new Game()); } catch { return false; }
    if (!pgn) return false;
    if (!Array.isArray(pgn.white)) return false;
    if (!Array.isArray(pgn.black)) return false;
    const whiteMoveCount = pgn.white.length;
    const blackMoveCount = pgn.black.length;
    if (blackMoveCount > whiteMoveCount) return false;
    if (blackMoveCount < (whiteMoveCount - 1)) return false;
    return true;
  }

  static standardize(gameJson) {
    logger.trace('standardize');
    if (!this.isValid(gameJson)) { throw new Error('Invalid game json'); }
    const pgn = gameJson.pgn.white.map((whiteMove, i) => ({
      white: whiteMove,
      black: gameJson.pgn.black[i],
    }));
    return { ...gameJson, pgn };
  }
}

export default SchemaUtil_0_0_1;
