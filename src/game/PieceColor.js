import Logger from '../utils/Logger';

const logger = new Logger('PieceColor');

class PieceColor {
  static none = 0;

  static white = 8;

  static black = 16;

  static fromPieceValue = (val) => {
    logger.trace('PieceColor.fromPieceValue', { val });
    if (val >= PieceColor.black) return PieceColor.black;
    if (val >= PieceColor.white) return PieceColor.white;
    return PieceColor.none;
  };

  static fromFEN = (val) => {
    logger.trace('PieceColor.fromFEN', { val });
    return (val === val.toUpperCase()
      ? PieceColor.white
      : PieceColor.black);
  }

  static updateCasing = (symbol, color) => {
    logger.trace('PieceColor.updateCasing', { symbol, color });
    return (color === PieceColor.white
      ? symbol.toUpperCase()
      : symbol.toLowerCase());
  }

  static opposite = (val) => {
    logger.trace('PieceColor.opposite', { val });
    switch (val) {
      case PieceColor.white: return PieceColor.black;
      case PieceColor.black: return PieceColor.white;
      default: return val;
    }
  };

  static toString = (val) => {
    logger.trace('PieceColor.toString', { val });
    switch (val) {
      case PieceColor.white: return 'White';
      case PieceColor.black: return 'Black';
      default: return '';
    }
  };
}

export default PieceColor;
