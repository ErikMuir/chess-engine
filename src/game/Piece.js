import PieceColor from './PieceColor';
import PieceType from './PieceType';
import { getPieceImage } from './PieceImages';
import Logger from '../utils/Logger';

const logger = new Logger('Piece');

class Piece {
  constructor(color, type) {
    logger.trace('Piece.ctor', { color, type });
    this.color = color;
    this.type = type;
    this.value = color | type;
  }

  getImage = async () => {
    logger.trace('Piece.getImage');
    return getPieceImage(this);
  }

  static fromPieceValue = (val) => {
    logger.trace('Piece.fromPieceValue', { val });
    if (!val) return null;
    const color = PieceColor.fromPieceValue(val);
    const type = PieceType.fromPieceValue(val);
    return new Piece(color, type);
  };

  static fromFEN = (val) => {
    logger.trace('Piece.fromFEN', { val });
    const color = PieceColor.fromFEN(val);
    const type = PieceType.fromFEN(val);
    return new Piece(color, type);
  };

  static toString = (val) => {
    logger.trace('Piece.toString', { val });
    const symbol = PieceType.toString(val.type);
    return PieceColor.updateCasing(symbol, val.color);
  };
}

export default Piece;
