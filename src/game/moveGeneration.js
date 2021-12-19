/* eslint-disable no-continue */
import Move from './Move';
import MoveType from './MoveType';
import Piece from './Piece';
import PieceColor from './PieceColor';
import PieceType from './PieceType';
import { directionIndex, directionOffsets } from './utils';

const generatePawnMoves = (fromIndex, piece, squares, enPassantTargetSquare) => {
  const moves = [];

  const moveForward = piece.color === PieceColor.white
    ? directionIndex.north
    : directionIndex.south;
  const attackLeft = piece.color === PieceColor.white
    ? directionIndex.northWest
    : directionIndex.southEast;
  const attackRight = piece.color === PieceColor.white
    ? directionIndex.northEast
    : directionIndex.southWest;

  // check one square forward
  const forwardSquareIndex = fromIndex + directionOffsets[moveForward];
  const forwardSquarePiece = squares[forwardSquareIndex];
  if (!forwardSquarePiece) {
    moves.push(new Move(MoveType.normal, fromIndex, forwardSquareIndex, squares));
  }

  // check two squares forward
  const rank = Math.floor(fromIndex / 8);
  const isFirstMove = (
    (piece.color === PieceColor.white && rank === 1)
    || (piece.color === PieceColor.black && rank === 6)
  );
  if (isFirstMove) {
    const doubleSquareIndex = forwardSquareIndex + directionOffsets[moveForward];
    const doubleSquarePiece = squares[doubleSquareIndex];
    if (!forwardSquarePiece && !doubleSquarePiece) {
      moves.push(new Move(MoveType.normal, fromIndex, doubleSquareIndex, squares));
    }
  }

  // check attack left
  const attackLeftSquareIndex = fromIndex + directionOffsets[attackLeft];
  const attackLeftSquarePiece = Piece.fromPieceValue(squares[attackLeftSquareIndex]);
  const isAttackLeftOpponent = attackLeftSquarePiece
    && attackLeftSquarePiece.color !== piece.color;
  if (isAttackLeftOpponent) {
    moves.push(new Move(MoveType.capture, fromIndex, attackLeftSquareIndex, squares));
  }

  // check attack right
  const attackRightSquareIndex = fromIndex + directionOffsets[attackRight];
  const attackRightSquarePiece = Piece.fromPieceValue(squares[attackRightSquareIndex]);
  const isAttackRightOpponent = attackRightSquarePiece
    && attackRightSquarePiece.color !== piece.color;
  if (isAttackRightOpponent) {
    moves.push(new Move(MoveType.capture, fromIndex, attackRightSquareIndex, squares));
  }

  // check en passant
  if ([attackLeftSquareIndex, attackRightSquareIndex].includes(enPassantTargetSquare)) {
    moves.push(new Move(MoveType.enPassant, fromIndex, enPassantTargetSquare, squares));
  }

  return moves;
};

const generateKnightMoves = (fromIndex, piece, squares, numSquaresToEdge) => {
  const moves = [];

  const checkMove = (passingIndex, dirIndex) => {
    const toIndex = passingIndex + directionOffsets[dirIndex];
    const toPiece = Piece.fromPieceValue(squares[toIndex]);

    // blocked by friendly piece
    if (toPiece && toPiece.color === piece.color) return;

    const moveType = toPiece ? MoveType.capture : MoveType.normal;

    moves.push(new Move(moveType, fromIndex, toIndex, squares));
  };

  const northEdge = numSquaresToEdge[fromIndex][directionIndex.north];
  const southEdge = numSquaresToEdge[fromIndex][directionIndex.south];
  const westEdge = numSquaresToEdge[fromIndex][directionIndex.west];
  const eastEdge = numSquaresToEdge[fromIndex][directionIndex.east];

  if (northEdge > 1) {
    const northIndex = fromIndex + directionOffsets[directionIndex.north];
    if (westEdge > 0) checkMove(northIndex, directionIndex.northWest);
    if (eastEdge > 0) checkMove(northIndex, directionIndex.northEast);
  }

  if (southEdge > 1) {
    const southIndex = fromIndex + directionOffsets[directionIndex.south];
    if (westEdge > 0) checkMove(southIndex, directionIndex.southWest);
    if (eastEdge > 0) checkMove(southIndex, directionIndex.southEast);
  }

  if (westEdge > 1) {
    const westIndex = fromIndex + directionOffsets[directionIndex.west];
    if (northEdge > 0) checkMove(westIndex, directionIndex.northWest);
    if (southEdge > 0) checkMove(westIndex, directionIndex.southWest);
  }

  if (eastEdge > 1) {
    const eastIndex = fromIndex + directionOffsets[directionIndex.east];
    if (northEdge > 0) checkMove(eastIndex, directionIndex.northEast);
    if (southEdge > 0) checkMove(eastIndex, directionIndex.southEast);
  }

  return moves;
};

const generateKingMoves = (fromIndex, piece, squares, numSquaresToEdge, castlingAvailability) => {
  const moves = [];

  for (let dirIndex = 0; dirIndex < 8; dirIndex += 1) {
    const toIndex = fromIndex + directionOffsets[dirIndex];

    // blocked by edge of board
    if (numSquaresToEdge[fromIndex][dirIndex] === 0) continue;

    const toPiece = Piece.fromPieceValue(squares[toIndex]);

    // blocked by friendly piece
    if (toPiece && toPiece.color === piece.color) continue;

    const moveType = toPiece ? MoveType.capture : MoveType.normal;

    moves.push(new Move(moveType, fromIndex, toIndex, squares));
  }

  // add castling moves
  castlingAvailability
    .filter((x) => x.color === piece.color)
    .forEach((x) => {
      const dirIndex = x.type === PieceType.king ? directionIndex.east : directionIndex.west;
      const offset = directionOffsets[dirIndex];
      const passingSquarePiece = squares[fromIndex + offset];
      const landingSquareIndex = fromIndex + (offset * 2);
      const landingSquarePiece = squares[landingSquareIndex];
      if (passingSquarePiece || landingSquarePiece) return;
      const moveType = x.type === PieceType.king
        ? MoveType.kingSideCastle
        : MoveType.queenSideCastle;
      moves.push(new Move(moveType, fromIndex, landingSquareIndex, squares));
    });

  return moves;
};

const generateSlidingMoves = (fromIndex, piece, squares, numSquaresToEdge) => {
  const moves = [];

  const startDirIndex = piece.type === PieceType.bishop ? 4 : 0;
  const endDirIndex = piece.type === PieceType.rook ? 4 : 8;

  for (let dirIndex = startDirIndex; dirIndex < endDirIndex; dirIndex += 1) {
    for (let n = 0; n < numSquaresToEdge[fromIndex][dirIndex]; n += 1) {
      const toIndex = fromIndex + directionOffsets[dirIndex] * (n + 1);
      const toPiece = Piece.fromPieceValue(squares[toIndex]);

      // blocked by friendly piece, so can't move any further in this direction
      if (toPiece && toPiece.color === piece.color) break;

      const moveType = toPiece ? MoveType.capture : MoveType.normal;

      moves.push(new Move(moveType, fromIndex, toIndex, squares));

      // can't move any further in this direction after capturing opponent's piece
      if (toPiece && toPiece.color !== piece.color) break;
    }
  }

  return moves;
};

const generatePseudoLegalMoves = ({
  squares,
  numSquaresToEdge,
  castlingAvailability,
  enPassantTargetSquare,
}) => {
  const moves = [];
  for (let fromIndex = 0; fromIndex < 64; fromIndex += 1) {
    const pieceValue = squares[fromIndex];
    const piece = Piece.fromPieceValue(pieceValue);
    if (!piece) continue;
    switch (piece.type) {
      case PieceType.pawn:
        moves.push(...generatePawnMoves(fromIndex, piece, squares, enPassantTargetSquare));
        break;
      case PieceType.knight:
        moves.push(...generateKnightMoves(fromIndex, piece, squares, numSquaresToEdge));
        break;
      case PieceType.king:
        moves.push(...generateKingMoves(fromIndex, piece, squares, numSquaresToEdge, castlingAvailability));
        break;
      case PieceType.bishop:
      case PieceType.rook:
      case PieceType.queen:
        moves.push(...generateSlidingMoves(fromIndex, piece, squares, numSquaresToEdge));
        break;
      default:
        break;
    }
  }
  return moves;
};

export { generatePseudoLegalMoves };
