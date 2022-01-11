import { getColorString } from './PieceColors';
import blackPawn from '../assets/images/black-pawn.svg';
import blackKnight from '../assets/images/black-knight.svg';
import blackBishop from '../assets/images/black-bishop.svg';
import blackRook from '../assets/images/black-rook.svg';
import blackQueen from '../assets/images/black-queen.svg';
import blackKing from '../assets/images/black-king.svg';
import whitePawn from '../assets/images/white-pawn.svg';
import whiteKnight from '../assets/images/white-knight.svg';
import whiteBishop from '../assets/images/white-bishop.svg';
import whiteRook from '../assets/images/white-rook.svg';
import whiteQueen from '../assets/images/white-queen.svg';
import whiteKing from '../assets/images/white-king.svg';

const rawPieceSVGs = {
  white: {
    p: whitePawn,
    n: whiteKnight,
    b: whiteBishop,
    r: whiteRook,
    q: whiteQueen,
    k: whiteKing,
  },
  black: {
    p: blackPawn,
    n: blackKnight,
    b: blackBishop,
    r: blackRook,
    q: blackQueen,
    k: blackKing,
  },
};

const cachedPieceImages = {
  white: {},
  black: {},
};

const getPieceImage = async (piece) => new Promise((resolve, reject) => {
  if (!piece) resolve(null);
  const color = getColorString(piece.color).toLowerCase();
  const type = piece.type.symbol.toLowerCase();
  if (cachedPieceImages[color][type]) resolve(cachedPieceImages[color][type]);
  const img = new Image();
  img.onload = () => {
    cachedPieceImages[color][type] = img;
    resolve(cachedPieceImages[color][type]);
  };
  img.onerror = () => {
    reject();
  };
  img.src = rawPieceSVGs[color][type];
});

export {
  getPieceImage,
};
