import PieceColor from './PieceColor';
import PieceType from './PieceType';
import MoveType from './MoveType';
import { getRank } from './utils';
import Logger from '../utils/Logger';

const logger = new Logger('Move');

class Move {
  constructor(type, fromIndex, toIndex, squares) {
    logger.trace('Move.ctor');
    this.type = type;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.piece = squares[fromIndex];
    this.capturePiece = type === MoveType.enPassant
      ? PieceColor.opposite(this.pieceColor) | PieceType.pawn
      : squares[toIndex];
    this.isCheck = false;
    this.isCheckmate = false;
    this.pawnPromotionType = PieceType.queen;
  }

  get pieceType() {
    logger.trace('Move.pieceType');
    return PieceType.fromPieceValue(this.piece);
  }

  get pieceColor() {
    logger.trace('Move.pieceColor');
    return PieceColor.fromPieceValue(this.piece);
  }

  get isPawnPromotion() {
    logger.trace('Move.isPawnPromotion');
    const isPawn = this.pieceType === PieceType.pawn;
    const promotionRank = this.pieceColor === PieceColor.white ? 7 : 0;
    const isPromotionRank = getRank(this.toIndex) === promotionRank;
    return isPawn && isPromotionRank;
  }
}

export default Move;
