import MoveType from './MoveType';
import PieceType from './PieceType';
import { getFile, getRank, getCoordinatesFromSquareIndex } from './utils';
import Logger from '../utils/Logger';

const logger = new Logger('PGN');

class PGN {
  static get = (move, legalMoves) => {
    logger.trace('PGN.get');
    let pgn = '';
    switch (move.type) {
      case MoveType.kingSideCastle:
        pgn += 'O-O';
        break;
      case MoveType.queenSideCastle:
        pgn += 'O-O-O';
        break;
      default:
        pgn += PGN.#getPiece(move, legalMoves);
        pgn += PGN.#getAction(move);
        pgn += PGN.#getDestination(move);
        break;
    }
    pgn += PGN.#getResult(move);
    return pgn;
  };

  static #getPiece = (move, legalMoves = []) => {
    if (move.pieceType === PieceType.pawn) {
      return MoveType.captureMoves.includes(move.type)
        ? 'abcdefgh'[getFile(move.fromIndex)]
        : '';
    }

    const symbol = PieceType.toString(move.pieceType);

    const isAmbiguousType = PieceType.ambiguousTypes.includes(move.pieceType);
    if (!isAmbiguousType) return symbol;

    const ambiguousMoves = legalMoves.filter((x) => x.pieceType === move.pieceType
      && x.toIndex === move.toIndex
      && x.fromIndex !== move.fromIndex);
    if (ambiguousMoves.length === 0) return symbol;

    const file = getFile(move.fromIndex);
    const isFileUnique = !ambiguousMoves.some((x) => getFile(x.fromIndex) === file);
    if (isFileUnique) return `${symbol}${'abcdefgh'[file]}`;

    const rank = getRank(move.fromIndex);
    const isRankUnique = !ambiguousMoves.some((x) => getRank(x.fromIndex) === rank);
    if (isRankUnique) return `${symbol}${rank + 1}`;

    return `${symbol}${'abcdefgh'[file]}${rank + 1}`;
  };

  static #getAction = (move) => (MoveType.captureMoves.includes(move.type) ? 'x' : '');

  static #getDestination = (move) => getCoordinatesFromSquareIndex(move.toIndex);

  static #getResult = (move) => {
    let result = '';
    if (move.isPawnPromotion) {
      const type = move.pawnPromotionType;
      const symbol = PieceType.toString(type);
      result += `=${symbol}`;
    }
    if (move.isCheckmate) result += '#';
    else if (move.isCheck) result += '+';
    return result;
  };
}

export default PGN;
