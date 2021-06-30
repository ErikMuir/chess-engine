import PieceColor from './PieceColor';
import PieceType from './PieceType';

class Piece {
  constructor(color, type) {
    this.color = color;
    this.type = type;
    this.value = color | type;
  }

  static fromPieceValue = (val) => {
    if (!val) return null;
    const color = PieceColor.fromPieceValue(val);
    const type = PieceType.fromPieceValue(val);
    return new Piece(color, type);
  };

  static fromFEN = (val) => {
    const color = PieceColor.fromFEN(val);
    const type = PieceType.fromFEN(val);
    return new Piece(color, type);
  };

  static toString = (val) => {
    const symbol = PieceType.toString(val.type);
    return PieceColor.updateCasing(symbol, val.color);
  };
}

export default Piece;
