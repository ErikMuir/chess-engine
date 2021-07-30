/* eslint-disable no-continue */
import FEN from './FEN';
import PGN from './PGN';
import PieceColor from './PieceColor';
import PieceType from './PieceType';
import Piece from './Piece';
import MoveType from './MoveType';
import Move from './Move';
import { getFile } from './utils';
import { startPosition, directionIndex, directionOffsets } from './constants';
import Logger from '../utils/Logger';

const logger = new Logger('Game');

export default class Game {
  constructor({ fen = startPosition, preventRecursion = false } = {}) {
    logger.trace('Game.ctor', { fen, preventRecursion });
    this.squares = new Array(64);
    this.numSquaresToEdge = new Array(64);
    this.activePlayer = null;
    this.isCapture = false;
    this.enPassantTargetSquare = null;
    this.castlingAvailability = [];
    this.halfMoveClock = null;
    this.fullMoveNumber = null;
    this.pseudoLegalMoves = [];
    this.legalMoves = [];
    this.moveHistory = [];
    this.pgnParts = [];

    this.preventRecursion = preventRecursion;
    FEN.load(fen, this);
    this.init();
    this.generateMoves();
  }

  get isGameOver() {
    logger.trace('Game.isGameOver');
    return this.legalMoves.length === 0;
  }

  get isCheck() {
    logger.trace('Game.isCheck');
    const king = this.activePlayer | PieceType.king;
    return this.pseudoLegalMoves.some((move) => move.capturePiece === king);
  }

  get isCheckmate() {
    logger.trace('Game.isCheckmate');
    return this.isGameOver && this.isCheck;
  }

  get pgn() {
    logger.trace('Game.pgn');
    return this.pgnParts.join(' ');
  }

  init = () => {
    logger.trace('Game.init');
    for (let file = 0; file < 8; file += 1) {
      for (let rank = 0; rank < 8; rank += 1) {
        const numNorth = 7 - rank;
        const numSouth = rank;
        const numWest = file;
        const numEast = 7 - file;

        const squareIndex = rank * 8 + file;

        this.numSquaresToEdge[squareIndex] = [
          numNorth,
          numSouth,
          numWest,
          numEast,
          Math.min(numNorth, numWest),
          Math.min(numSouth, numEast),
          Math.min(numNorth, numEast),
          Math.min(numSouth, numWest),
        ];
      }
    }
  };

  doMove = (move) => {
    logger.trace('Game.doMove', { move });
    this.squares[move.fromIndex] = null;
    this.squares[move.toIndex] = this.getMovePiece(move);
    switch (move.type) {
      case MoveType.enPassant:
        this.handleEnPassant(move);
        break;
      case MoveType.castle:
        this.handleCastle(move);
        break;
      default:
        break;
    }
  };

  getMovePiece = (move) => {
    logger.trace('Game.getMovePiece', { move });
    if (!move.isPawnPromotion) return move.piece;
    return this.activePlayer | move.pawnPromotionType;
  };

  handleEnPassant = (move) => {
    logger.trace('Game.handleEnPassant', { move });
    const offset = PieceColor.fromPieceValue(move.piece) === PieceColor.white ? -8 : 8;
    const captureSquareIndex = move.toIndex + offset;
    this.squares[captureSquareIndex] = null;
  };

  handleCastle = (move) => {
    logger.trace('Game.handleCastle', { move });
    const isKingSide = getFile(move.toIndex) === 6;
    const rookRank = PieceColor.fromPieceValue(move.piece) === PieceColor.white ? 0 : 7;
    const rookFile = isKingSide ? 7 : 0;
    const targetFile = isKingSide ? 5 : 3;
    const fromIndex = rookRank * 8 + rookFile;
    const toIndex = rookRank * 8 + targetFile;
    this.squares[toIndex] = this.squares[fromIndex];
    this.squares[fromIndex] = null;
  };

  postMoveActions = (move) => {
    logger.trace('Game.postMoveActions', { move });
    const legalMoves = [...this.legalMoves];
    this.setEnPassantTargetSquare(move);
    this.updateCastlingAvailability(move);
    this.setHalfMoveClock(move);
    this.togglePlayerTurn();
    this.generateMoves();
    if (!this.isGameOver) {
      this.updateFullMoveNumber(move);
    }
    this.updateMove(move);
    this.appendToPgn(move, legalMoves);
    this.archiveMove(move);
  };

  setEnPassantTargetSquare = (move) => {
    logger.trace('Game.setEnPassantTargetSquare', { move });
    const isPawn = PieceType.fromPieceValue(move.piece) === PieceType.pawn;
    const distance = Math.abs(move.toIndex - move.fromIndex);
    const color = PieceColor.fromPieceValue(move.piece);
    const targetOffset = color === PieceColor.white ? -8 : 8;
    this.enPassantTargetSquare = isPawn && distance === 16
      ? move.toIndex + targetOffset
      : -1;
  };

  updateCastlingAvailability = (move) => {
    logger.trace('Game.updateCastlingAvailability', { move });
    if (this.castlingAvailability.length === 0) return;
    const { color, type } = Piece.fromPieceValue(move.piece);
    const fromFile = getFile(move.fromIndex);
    if (type === PieceType.king) {
      this.castlingAvailability = this.castlingAvailability.filter((x) => x.color !== color);
    } else if (type === PieceType.rook && [0, 7].includes(fromFile)) {
      const side = fromFile === 0 ? PieceType.queen : PieceType.king;
      this.castlingAvailability = this.castlingAvailability
        .filter((x) => x.color !== color || x.type !== side);
    }
  };

  setHalfMoveClock = (move) => {
    logger.trace('Game.setMoveClock', { move });
    const isCapture = !!move.capturePiece;
    const isPawn = PieceType.fromPieceValue(move.piece) === PieceType.pawn;
    this.halfMoveClock = isCapture || isPawn ? 0 : this.halfMoveClock + 1;
  };

  togglePlayerTurn = () => {
    logger.trace('Game.togglePlayerTurn');
    this.activePlayer = this.activePlayer === PieceColor.white
      ? PieceColor.black
      : PieceColor.white;
  };

  updateFullMoveNumber = (move) => {
    logger.trace('Game.updateFullMoveNumber', { move });
    if (PieceColor.fromPieceValue(move.piece) === PieceColor.black) {
      this.fullMoveNumber += 1;
    }
  };

  updateMove = (move) => {
    logger.trace('Game.updateMove', { move });
    move.isCheck = this.isCheck;
    move.isCheckmate = this.isCheckmate;
  };

  archiveMove = (move) => {
    logger.trace('Game.archiveMove', { move });
    this.moveHistory.push(move);
  }

  appendToPgn = (move, legalMoves) => {
    logger.trace('Game.appendToPgn', { move });
    if (PieceColor.fromPieceValue(move.piece) === PieceColor.white) {
      this.pgnParts.push(`${this.fullMoveNumber}.`);
    }
    this.pgnParts.push(PGN.get(move, legalMoves));
  };

  generateMoves = () => {
    this.pseudoLegalMoves = this.generatePseudoLegalMoves();
    if (this.preventRecursion) return;
    this.legalMoves = this.generateLegalMoves();
  };

  generatePseudoLegalMoves = () => {
    logger.trace('Game.generatePseudoLegalMoves');
    const moves = [];
    for (let fromIndex = 0; fromIndex < 64; fromIndex += 1) {
      const pieceValue = this.squares[fromIndex];
      const piece = Piece.fromPieceValue(pieceValue);
      if (!piece) continue;
      switch (piece.type) {
        case PieceType.pawn:
          moves.push(...this.generatePawnMoves(fromIndex, piece));
          break;
        case PieceType.knight:
          moves.push(...this.generateKnightMoves(fromIndex, piece));
          break;
        case PieceType.king:
          moves.push(...this.generateKingMoves(fromIndex, piece));
          break;
        case PieceType.bishop:
        case PieceType.rook:
        case PieceType.queen:
          moves.push(...this.generateSlidingMoves(fromIndex, piece));
          break;
        default:
          break;
      }
    }
    return moves;
  };

  generateLegalMoves = () => {
    logger.trace('Game.generateLegalMoves');
    const activePlayerMoves = this.pseudoLegalMoves
      .filter((move) => PieceColor.fromPieceValue(move.piece) === this.activePlayer);
    if (this.preventRecursion) return activePlayerMoves;
    const fen = FEN.get(this);
    const moves = [];
    activePlayerMoves.forEach((move) => {
      const futureGame = new Game({ fen, preventRecursion: true });
      futureGame.doMove(move);
      futureGame.generateMoves();
      const isCheck = futureGame.testForCheck(this.activePlayer);
      if (!isCheck) moves.push(move);
    });
    return moves;
  };

  generatePawnMoves = (fromIndex, piece) => {
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
    const forwardSquarePiece = this.squares[forwardSquareIndex];
    if (!forwardSquarePiece) {
      moves.push(new Move(MoveType.normal, fromIndex, forwardSquareIndex, this.squares));
    }

    // check two squares forward
    const rank = Math.floor(fromIndex / 8);
    const isFirstMove = (
      (piece.color === PieceColor.white && rank === 1)
      || (piece.color === PieceColor.black && rank === 6)
    );
    if (isFirstMove) {
      const doubleSquareIndex = forwardSquareIndex + directionOffsets[moveForward];
      const doubleSquarePiece = this.squares[doubleSquareIndex];
      if (!forwardSquarePiece && !doubleSquarePiece) {
        moves.push(new Move(MoveType.normal, fromIndex, doubleSquareIndex, this.squares));
      }
    }

    // check attack left
    const attackLeftSquareIndex = fromIndex + directionOffsets[attackLeft];
    const attackLeftSquarePiece = this.squares[attackLeftSquareIndex];
    const isAttackLeftOpponent = attackLeftSquarePiece
      && attackLeftSquarePiece.color !== piece.color;
    if (isAttackLeftOpponent) {
      moves.push(new Move(MoveType.capture, fromIndex, attackLeftSquareIndex, this.squares));
    }

    // check attack right
    const attackRightSquareIndex = fromIndex + directionOffsets[attackRight];
    const attackRightSquarePiece = this.squares[attackRightSquareIndex];
    const isAttackRightOpponent = attackRightSquarePiece
      && attackRightSquarePiece.color !== piece.color;
    if (isAttackRightOpponent) {
      moves.push(new Move(MoveType.capture, fromIndex, attackRightSquareIndex, this.squares));
    }

    // check en passant
    if ([attackLeftSquareIndex, attackRightSquareIndex].includes(this.enPassantTargetSquare)) {
      moves.push(new Move(MoveType.enPassant, fromIndex, this.enPassantTargetSquare, this.squares));
    }

    return moves;
  };

  generateKnightMoves = (fromIndex, piece) => {
    const moves = [];

    const checkMove = (passingIndex, dirIndex) => {
      const toIndex = passingIndex + directionOffsets[dirIndex];
      const toPiece = Piece.fromPieceValue(this.squares[toIndex]);

      // blocked by friendly piece
      if (toPiece && toPiece.color === piece.color) return;

      const moveType = toPiece ? MoveType.capture : MoveType.normal;

      moves.push(new Move(moveType, fromIndex, toIndex, this.squares));
    };

    const northEdge = this.numSquaresToEdge[fromIndex][directionIndex.north];
    const southEdge = this.numSquaresToEdge[fromIndex][directionIndex.south];
    const westEdge = this.numSquaresToEdge[fromIndex][directionIndex.west];
    const eastEdge = this.numSquaresToEdge[fromIndex][directionIndex.east];

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

  generateKingMoves = (fromIndex, piece) => {
    const moves = [];

    for (let dirIndex = 0; dirIndex < 8; dirIndex += 1) {
      const toIndex = fromIndex + directionOffsets[dirIndex];

      // blocked by edge of board
      if (this.numSquaresToEdge[fromIndex][dirIndex] === 0) continue;

      const toPiece = Piece.fromPieceValue(this.squares[toIndex]);

      // blocked by friendly piece
      if (toPiece && toPiece.color === piece.color) continue;

      const moveType = toPiece ? MoveType.capture : MoveType.normal;

      moves.push(new Move(moveType, fromIndex, toIndex, this.squares));
    }

    // add castling moves
    this.castlingAvailability
      .filter((x) => x.color === piece.color)
      .forEach((x) => {
        const dirIndex = x.type === PieceType.king ? directionIndex.east : directionIndex.west;
        const offset = directionOffsets[dirIndex];
        const passingSquarePiece = this.squares[fromIndex + offset];
        const landingSquareIndex = fromIndex + (offset * 2);
        const landingSquarePiece = this.squares[landingSquareIndex];
        if (passingSquarePiece || landingSquarePiece) return;
        const moveType = x.type === PieceType.king
          ? MoveType.kingSideCastle
          : MoveType.queenSideCastle;
        moves.push(new Move(moveType, fromIndex, landingSquareIndex, this.squares));
      });

    return moves;
  };

  generateSlidingMoves = (fromIndex, piece) => {
    const moves = [];

    const startDirIndex = piece.type === PieceType.bishop ? 4 : 0;
    const endDirIndex = piece.type === PieceType.rook ? 4 : 8;

    for (let dirIndex = startDirIndex; dirIndex < endDirIndex; dirIndex += 1) {
      for (let n = 0; n < this.numSquaresToEdge[fromIndex][dirIndex]; n += 1) {
        const toIndex = fromIndex + directionOffsets[dirIndex] * (n + 1);
        const toPiece = Piece.fromPieceValue(this.squares[toIndex]);

        // blocked by friendly piece, so can't move any further in this direction
        if (toPiece && toPiece.color === piece.color) break;

        const moveType = toPiece ? MoveType.capture : MoveType.normal;

        moves.push(new Move(moveType, fromIndex, toIndex, this.squares));

        // can't move any further in this direction after capturing opponent's piece
        if (toPiece && toPiece.color !== piece.color) break;
      }
    }

    return moves;
  };

  testForCheck = (color = this.activePlayer) => {
    const king = color | PieceType.king;
    return this.pseudoLegalMoves.some((move) => move.capturePiece === king);
  };
}
