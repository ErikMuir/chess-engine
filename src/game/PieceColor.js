class PieceColor {
  static none = 0;

  static white = 8;

  static black = 16;

  static fromPieceValue = (val) => {
    if (val >= PieceColor.black) return PieceColor.black;
    if (val >= PieceColor.white) return PieceColor.white;
    return PieceColor.none;
  };

  static fromFEN = (val) => (val === val.toUpperCase()
    ? PieceColor.white
    : PieceColor.black)

  static updateCasing = (symbol, color) => (color === PieceColor.white
    ? symbol.toUpperCase()
    : symbol.toLowerCase())

  static opposite = (val) => {
    switch (val) {
      case PieceColor.white: return PieceColor.black;
      case PieceColor.black: return PieceColor.white;
      default: return val;
    }
  };

  static toString = (val) => {
    switch (val) {
      case PieceColor.white: return 'White';
      case PieceColor.black: return 'Black';
      default: return '';
    }
  };
}

export default PieceColor;
