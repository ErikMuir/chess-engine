import PieceColor from './PieceColor';
import PieceType from './PieceType';
import MoveType from './MoveType';
import { getRank } from './utils';

class Move {
  constructor(type, fromIndex, toIndex, squares) {
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
    return PieceType.fromPieceValue(this.piece);
  }

  get pieceColor() {
    return PieceColor.fromPieceValue(this.piece);
  }

  get isPawnPromotion() {
    const isPawn = this.pieceType === PieceType.pawn;
    const promotionRank = this.pieceColor === PieceColor.white ? 7 : 0;
    const isPromotionRank = getRank(this.toIndex) === promotionRank;
    return isPawn && isPromotionRank;
  }
}

export default Move;
