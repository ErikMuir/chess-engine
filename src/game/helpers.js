/* eslint-disable import/prefer-default-export */
import PieceColor from './PieceColor';
import PieceType from './PieceType';
import { whitePieces, blackPieces } from './pieces';

const getPieceImage = (piece) => {
  if (!piece) return null;
  let set;
  switch (piece.color) {
    case PieceColor.white: set = whitePieces; break;
    case PieceColor.black: set = blackPieces; break;
    default: return null;
  }
  switch (piece.type) {
    case PieceType.king: return set.king;
    case PieceType.pawn: return set.pawn;
    case PieceType.knight: return set.knight;
    case PieceType.bishop: return set.bishop;
    case PieceType.rook: return set.rook;
    case PieceType.queen: return set.queen;
    default: return null;
  }
};

export {
  getPieceImage,
};
