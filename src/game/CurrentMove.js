import PieceColor from './PieceColor';

class CurrentMove {
  constructor(moveNumber, pieceColor) {
    this.moveNumber = moveNumber;
    this.pieceColor = moveNumber === 0 ? PieceColor.none : pieceColor;
  }
}

export default CurrentMove;
