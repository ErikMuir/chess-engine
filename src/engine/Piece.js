import { pieceColorFromPieceId, pieceColorFromFEN, getSymbolForColor } from './PieceColors';
import { pieceTypeFromPieceId, pieceTypeFromFEN } from './PieceTypes';
import { getPieceImage } from './PieceImages';

class Piece {
  constructor(color, type) {
    this.color = color;
    this.type = type;
    this.id = color | type.id;
  }

  getImage = async () => getPieceImage(this);

  static fromPieceId = (pieceId) => {
    if (!pieceId) return null;
    const color = pieceColorFromPieceId(pieceId);
    const type = pieceTypeFromPieceId(pieceId);
    return new Piece(color, type);
  };

  static fromFEN = (val) => {
    const color = pieceColorFromFEN(val);
    const type = pieceTypeFromFEN(val);
    return new Piece(color, type);
  };

  static toString = (val) => getSymbolForColor(val.type.symbol, val.color);
}

export default Piece;
