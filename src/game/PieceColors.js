const white = 8;
const black = 16;
const noColor = 0;

const pieceColorFromPieceId = (pieceId) => {
  if (pieceId >= black) return black;
  if (pieceId >= white) return white;
  return noColor;
};

const pieceColorFromFEN = (val) => (val === val.toUpperCase()
  ? white
  : black);

const getSymbolForColor = (symbol, color) => (color === white
  ? symbol.toUpperCase()
  : symbol.toLowerCase());

const oppositeColor = (val) => {
  switch (val) {
    case white: return black;
    case black: return white;
    default: return noColor;
  }
};

const getColorString = (val) => {
  switch (val) {
    case white: return 'White';
    case black: return 'Black';
    default: return null;
  }
};

export {
  white,
  black,
  noColor,
  pieceColorFromPieceId,
  pieceColorFromFEN,
  getSymbolForColor,
  oppositeColor,
  getColorString,
};
