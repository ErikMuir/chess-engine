import { selector } from 'recoil';
import gameState from '../atoms/gameState';
import { black, white, pieceColorFromPieceId } from '../../engine/PieceColors';

const capturedPiecesState = selector({
  key: 'capturedPiecesState',
  get: ({ get }) => {
    const game = get(gameState);
    const capturedPieces = game.moveHistory
      .slice(0, game.currentMoveIndex)
      .filter((move) => move.capturePiece)
      .map((move) => move.capturePiece) || [];
    const blackPieces = capturedPieces.filter((pieceId) => pieceColorFromPieceId(pieceId) === black);
    const whitePieces = capturedPieces.filter((pieceId) => pieceColorFromPieceId(pieceId) === white);
    return { blackPieces, whitePieces };
  },
});

export default capturedPiecesState;
