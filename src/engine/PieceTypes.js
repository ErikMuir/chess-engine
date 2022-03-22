const king = { id: 1, symbol: 'K', value: 0 };
const pawn = { id: 2, symbol: 'P', value: 1 };
const knight = { id: 3, symbol: 'N', value: 3 };
const bishop = { id: 4, symbol: 'B', value: 3 };
const rook = { id: 5, symbol: 'R', value: 5 };
const queen = { id: 6, symbol: 'Q', value: 9 };

const allTypes = [king, queen, rook, bishop, knight, pawn];
const ambiguousTypes = [queen, rook, bishop, knight];
const promotionTypes = [queen, rook, bishop, knight];

const pieceTypeFromPieceId = (pieceId) => {
  const typeId = pieceId % 8;
  return allTypes.find((x) => x.id === typeId);
};

const pieceTypeFromFEN = (val) => {
  const symbol = val.toUpperCase();
  return allTypes.find((x) => x.symbol === symbol);
};

export {
  king,
  pawn,
  knight,
  bishop,
  rook,
  queen,
  allTypes,
  ambiguousTypes,
  promotionTypes,
  pieceTypeFromPieceId,
  pieceTypeFromFEN,
};
