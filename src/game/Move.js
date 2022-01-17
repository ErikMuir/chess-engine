import MoveType from './MoveType';
import { white, pieceColorFromPieceId, oppositeColor } from './PieceColors';
import { pawn, queen, pieceTypeFromPieceId } from './PieceTypes';
import { getRank } from './utils';

class Move {
  constructor(type, fromIndex, toIndex, squares) {
    this.type = type;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.piece = squares[fromIndex]; // TODO: rename to pieceId for accuracy
    this.capturePiece = type === MoveType.enPassant
      ? oppositeColor(this.pieceColor) | pawn.id
      : squares[toIndex];
    this.pawnPromotionType = queen; // hack for legal move generation
  }

  get pieceType() {
    return pieceTypeFromPieceId(this.piece);
  }

  get pieceColor() {
    return pieceColorFromPieceId(this.piece);
  }

  get isPawnPromotion() {
    const isPawn = this.pieceType === pawn;
    const promotionRank = this.pieceColor === white ? 7 : 0;
    const isPromotionRank = getRank(this.toIndex) === promotionRank;
    return isPawn && isPromotionRank;
  }
}

export default Move;
