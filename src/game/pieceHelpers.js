import PieceColor from './PieceColor';
import PieceType from './PieceType';
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

const rawPieceImages = {
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

const pieceImages = {
  white: {},
  black: {},
};

const getPieceImage = async (piece) => new Promise((resolve, reject) => {
  if (!piece) resolve(null);
  const color = PieceColor.toString(piece.color).toLowerCase();
  const type = PieceType.toString(piece.type).toLowerCase();
  if (pieceImages[color][type]) resolve(pieceImages[color][type]);
  const img = new Image();
  img.onload = () => {
    pieceImages[color][type] = img;
    resolve(pieceImages[color][type]);
  };
  img.onerror = () => {
    reject();
  };
  img.src = rawPieceImages[color][type];
});

export {
  getPieceImage,
};
