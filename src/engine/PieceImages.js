/* eslint-disable import/no-cycle */
import { getColorString } from '.';
import {
  blackPawn,
  blackKnight,
  blackBishop,
  blackRook,
  blackQueen,
  blackKing,
  whitePawn,
  whiteKnight,
  whiteBishop,
  whiteRook,
  whiteQueen,
  whiteKing,
} from '../assets/images/pieces';

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
