/* eslint-disable camelcase */
import Logger from '../Logger';
import ISchemaUtil from './ISchemaUtil';
import FEN from '../game/FEN';
import Game from '../game/Game';

const logger = new Logger('SchemaUtil_1_0_0');

/**
 * SchemaUtil_1_0_0
 *
 * @class SchemaUtil_1_0_0
 * @extends {ISchemaUtil}
 */
class SchemaUtil_1_0_0 extends ISchemaUtil {
  static isValid({ fen, pgn }) {
    logger.trace('isValid');
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
  }

  static standardize(gameJson) {
    logger.trace('standardize');
    if (!this.isValid(gameJson)) { throw new Error('Invalid game json'); }
    return { ...gameJson };
  }
}

export default SchemaUtil_1_0_0;
