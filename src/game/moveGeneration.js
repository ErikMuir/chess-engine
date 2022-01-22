/* eslint-disable import/no-cycle */
/* eslint-disable no-continue */
import { randomElement } from '../utils';
import Game from './Game';
import Move from './Move';
import MoveType from './MoveType';
import Piece from './Piece';
import {
  white,
  black,
  pieceColorFromPieceId,
  oppositeColor,
} from './PieceColors';
import {
  king,
  pawn,
  knight,
  bishop,
  rook,
  queen,
  pieceTypeFromPieceId,
} from './PieceTypes';
import {
  getNumSquaresToEdge,
  directionIndex,
  directionOffsets,
} from './utils';

const generatePawnMoves = (fromIndex, piece, squares, enPassantTargetSquare) => {
  const moves = [];
  const numSquaresToEdge = getNumSquaresToEdge();

  // check one square forward
  const moveForward = piece.color === white ? directionIndex.north : directionIndex.south;
  const forwardSquareIndex = fromIndex + directionOffsets[moveForward];
  const forwardSquarePiece = squares[forwardSquareIndex];
  if (!forwardSquarePiece) {
    moves.push(new Move(MoveType.normal, fromIndex, forwardSquareIndex, squares));
  }

  // check two squares forward
  const rank = Math.floor(fromIndex / 8);
  const isFirstMove = (piece.color === white && rank === 1) || (piece.color === black && rank === 6);
  if (isFirstMove) {
    const doubleSquareIndex = forwardSquareIndex + directionOffsets[moveForward];
    const doubleSquarePiece = squares[doubleSquareIndex];
    if (!forwardSquarePiece && !doubleSquarePiece) {
      moves.push(new Move(MoveType.normal, fromIndex, doubleSquareIndex, squares));
    }
  }

  // check attack left
  let attackLeftSquareIndex;
  const leftDirection = piece.color === white ? directionIndex.west : directionIndex.east;
  const leftEdge = numSquaresToEdge[fromIndex][leftDirection];
  if (leftEdge > 0) {
    const attackLeft = piece.color === white ? directionIndex.northWest : directionIndex.southEast;
    attackLeftSquareIndex = fromIndex + directionOffsets[attackLeft];
    const attackLeftSquarePiece = Piece.fromPieceId(squares[attackLeftSquareIndex]);
    const isAttackLeftOpponent = attackLeftSquarePiece && attackLeftSquarePiece.color !== piece.color;
    if (isAttackLeftOpponent) {
      moves.push(new Move(MoveType.capture, fromIndex, attackLeftSquareIndex, squares));
    }
  }

  // check attack right
  let attackRightSquareIndex;
  const rightDirection = piece.color === white ? directionIndex.east : directionIndex.west;
  const rightEdge = numSquaresToEdge[fromIndex][rightDirection];
  if (rightEdge > 0) {
    const attackRight = piece.color === white ? directionIndex.northEast : directionIndex.southWest;
    attackRightSquareIndex = fromIndex + directionOffsets[attackRight];
    const attackRightSquarePiece = Piece.fromPieceId(squares[attackRightSquareIndex]);
    const isAttackRightOpponent = attackRightSquarePiece && attackRightSquarePiece.color !== piece.color;
    if (isAttackRightOpponent) {
      moves.push(new Move(MoveType.capture, fromIndex, attackRightSquareIndex, squares));
    }
  }

  // check en passant
  if ([attackLeftSquareIndex, attackRightSquareIndex].includes(enPassantTargetSquare)) {
    moves.push(new Move(MoveType.enPassant, fromIndex, enPassantTargetSquare, squares));
  }

  return moves;
};

const generateKnightMoves = (fromIndex, piece, squares) => {
  const moves = [];
  const numSquaresToEdge = getNumSquaresToEdge();

  const checkMove = (passingIndex, dirIndex) => {
    const toIndex = passingIndex + directionOffsets[dirIndex];
    const toPiece = Piece.fromPieceId(squares[toIndex]);

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

const generateKingMoves = (fromIndex, piece, squares, castlingAvailability) => {
  const moves = [];
  const numSquaresToEdge = getNumSquaresToEdge();

  for (let dirIndex = 0; dirIndex < 8; dirIndex += 1) {
    const toIndex = fromIndex + directionOffsets[dirIndex];

    // blocked by edge of board
    if (numSquaresToEdge[fromIndex][dirIndex] === 0) continue;

    const toPiece = Piece.fromPieceId(squares[toIndex]);

    // blocked by friendly piece
    if (toPiece && toPiece.color === piece.color) continue;

    const moveType = toPiece ? MoveType.capture : MoveType.normal;

    moves.push(new Move(moveType, fromIndex, toIndex, squares));
  }

  // add castling moves
  castlingAvailability
    .filter((x) => x.color === piece.color)
    .forEach((x) => {
      const dirIndex = x.type === king ? directionIndex.east : directionIndex.west;
      const offset = directionOffsets[dirIndex];
      const passingSquarePiece = squares[fromIndex + offset];
      const landingSquareIndex = fromIndex + (offset * 2);
      const landingSquarePiece = squares[landingSquareIndex];
      if (passingSquarePiece || landingSquarePiece) return;
      const moveType = x.type === king
        ? MoveType.kingSideCastle
        : MoveType.queenSideCastle;
      moves.push(new Move(moveType, fromIndex, landingSquareIndex, squares));
    });

  return moves;
};

const generateSlidingMoves = (fromIndex, piece, squares) => {
  const moves = [];
  const numSquaresToEdge = getNumSquaresToEdge();

  const startDirIndex = piece.type === bishop ? 4 : 0;
  const endDirIndex = piece.type === rook ? 4 : 8;

  for (let dirIndex = startDirIndex; dirIndex < endDirIndex; dirIndex += 1) {
    for (let n = 0; n < numSquaresToEdge[fromIndex][dirIndex]; n += 1) {
      const toIndex = fromIndex + directionOffsets[dirIndex] * (n + 1);
      const toPiece = Piece.fromPieceId(squares[toIndex]);

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

const getPseudoLegalMoves = ({
  squares,
  castlingAvailability,
  enPassantTargetSquare,
}) => {
  const moves = [];
  for (let fromIndex = 0; fromIndex < 64; fromIndex += 1) {
    const pieceId = squares[fromIndex];
    const piece = Piece.fromPieceId(pieceId);
    if (!piece) continue;
    switch (piece.type) {
      case pawn:
        moves.push(...generatePawnMoves(fromIndex, piece, squares, enPassantTargetSquare));
        break;
      case knight:
        moves.push(...generateKnightMoves(fromIndex, piece, squares));
        break;
      case king:
        moves.push(...generateKingMoves(fromIndex, piece, squares, castlingAvailability));
        break;
      case bishop:
      case rook:
      case queen:
        moves.push(...generateSlidingMoves(fromIndex, piece, squares));
        break;
      default:
        break;
    }
  }
  return moves;
};

const isLegalMove = (move, { activePlayer, isCheck, fen }) => {
  // filter out other player moves
  if (pieceColorFromPieceId(move.piece) !== activePlayer) return false;

  // filter out illegal castling moves
  if (MoveType.castlingMoves.includes(move.type)) {
    if (isCheck) return false;
    const passingSquareIndex = move.type === MoveType.kingSideCastle
      ? move.fromIndex + 1
      : move.fromIndex - 1;
    const tempMove = {
      ...move,
      type: MoveType.normal,
      toIndex: passingSquareIndex,
    };
    const tempGame = new Game({ fen, preventRecursion: true });
    tempGame.doMove(tempMove);
    tempGame.pseudoLegalMoves = getPseudoLegalMoves(tempGame);
    if (tempGame.testForCheck(activePlayer)) return false;
  }

  // filter out self-check moves
  const futureGame = new Game({ fen, preventRecursion: true });
  futureGame.doMove(move);
  futureGame.pseudoLegalMoves = getPseudoLegalMoves(futureGame);
  if (futureGame.testForCheck(activePlayer)) return false;

  // allow all other moves
  return true;
};

const getLegalMoves = (game) => game.pseudoLegalMoves.filter((move) => isLegalMove(move, game));

const getCheckMoves = (moves, fen, activePlayer) => moves.filter((move) => {
  const opponent = oppositeColor(activePlayer);
  const futureGame = new Game({ fen, preventRecursion: true });
  futureGame.doMove(move);
  futureGame.pseudoLegalMoves = getPseudoLegalMoves(futureGame);
  const isCheck = futureGame.testForCheck(opponent);
  return isCheck;
});

const getCheckmateMoves = (moves, fen) => moves.filter((move) => {
  const futureGame = new Game({ fen, preventRecursion: true });
  futureGame.doMove(move);
  futureGame.pseudoLegalMoves = getPseudoLegalMoves(futureGame);
  futureGame.legalMoves = getLegalMoves(futureGame);
  const isCheckmate = futureGame.legalMoves.length === 0;
  return isCheckmate;
});

const getCaptureMoves = (moves) => moves.filter((move) => MoveType.captureMoves.includes(move.type));

const getRandomMove = (game) => randomElement(game.legalMoves);

const getMove = ({ legalMoves, activePlayer, fen }) => {
  let moves = [...legalMoves];
  const checkMoves = getCheckMoves(moves, fen, activePlayer);
  if (checkMoves && checkMoves.length) {
    moves = [...checkMoves];
    const checkmateMoves = getCheckmateMoves(moves, fen);
    if (checkmateMoves && checkmateMoves.length) {
      return checkmateMoves[0];
    }
  }
  const captureMoves = getCaptureMoves(moves);
  if (captureMoves && captureMoves.length) {
    captureMoves.sort((a, b) => {
      const aValue = pieceTypeFromPieceId(a.capturePiece).value;
      const bValue = pieceTypeFromPieceId(b.capturePiece).value;
      return bValue - aValue;
    });
    return captureMoves[0];
  }
  return randomElement(moves);
};

export {
  getPseudoLegalMoves,
  getLegalMoves,
  getRandomMove,
  getMove,
};
