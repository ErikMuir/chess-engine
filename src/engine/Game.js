/* eslint-disable import/no-cycle */
import FEN from './FEN';
import Move from './Move';
import MoveType from './MoveType';
import PGN from './PGN';
import Piece from './Piece';
import {
  white,
  black,
  pieceColorFromPieceId,
} from './PieceColors';
import {
  king,
  pawn,
  rook,
  queen,
  pieceTypeFromPieceId,
} from './PieceTypes';
import { getPseudoLegalMoves, getLegalMoves } from './moveGeneration';
import { getFile, startPosition } from './utils';
import Logger from '../Logger';

const log = new Logger('Game');
const schema = '0.1.1';

export default class Game {
  constructor({
    fen = startPosition,
    playerColor = white,
    preventRecursion = false,
    pgn = [],
  } = {}) {
    this.playerColor = playerColor;
    this.preventRecursion = preventRecursion;
    this.pgn = pgn;
    this.squares = new Array(64);
    this.activePlayer = null;
    this.isCapture = false;
    this.enPassantTargetSquare = null;
    this.castlingAvailability = [];
    this.halfMoveClock = null;
    this.fullMoveNumber = null;
    this.currentMoveIndex = 0;
    this.pseudoLegalMoves = [];
    this.legalMoves = [];
    this.moveHistory = [];
    this.fenHistory = [];
    this.isCheckmate = false;
    this.isStalemate = false;
    this.isResignation = false;
    this.isDraw = false;
    FEN.load(fen, this);
    this.archiveFen();
    this.generateMoves();
  }

  debug = (msg, obj) => {
    if (this.preventRecursion) return;
    if (obj) log.debug(msg, obj);
    else log.debug(msg);
  };

  get isGameOver() {
    return this.isCheckmate || this.isStalemate || this.isResignation || this.isDraw;
  }

  get isCheck() {
    const playerKing = this.activePlayer | king.id;
    return this.pseudoLegalMoves.some((move) => move.capturePiece === playerKing);
  }

  get game() {
    return {
      schema,
      playerColor: this.playerColor,
      fen: this.fen,
      moves: this.moveHistory.map((move) => ({ ...move })),
      pgn: [...this.pgn],
    };
  }

  get json() {
    return JSON.stringify(this.game);
  }

  get fen() {
    return FEN.get(this);
  }

  resign = () => {
    this.isResignation = true;
    const msg = this.activePlayer === white
      ? '0-1 (white resigns)'
      : '1-0 (black resigns)';
    this.pgn.push(msg);
    return this;
  };

  getMovePiece = (move) => (move.isPawnPromotion
    ? this.activePlayer | move.pawnPromotionType.id
    : move.piece);

  handleEnPassant = (move) => {
    const offset = pieceColorFromPieceId(move.piece) === white ? -8 : 8;
    const captureSquareIndex = move.toIndex + offset;
    this.squares[captureSquareIndex] = undefined;
  };

  handleCastle = (move) => {
    const isKingSide = getFile(move.toIndex) === 6;
    const rookRank = pieceColorFromPieceId(move.piece) === white ? 0 : 7;
    const rookFile = isKingSide ? 7 : 0;
    const targetFile = isKingSide ? 5 : 3;
    const fromIndex = rookRank * 8 + rookFile;
    const toIndex = rookRank * 8 + targetFile;
    this.squares[toIndex] = this.squares[fromIndex];
    this.squares[fromIndex] = undefined;
  };

  doMove = (move) => {
    this.debug('do move', { move });
    this.squares[move.fromIndex] = undefined;
    this.squares[move.toIndex] = this.getMovePiece(move);
    switch (move.type) {
      case MoveType.enPassant:
        this.handleEnPassant(move);
        break;
      case MoveType.kingSideCastle:
      case MoveType.queenSideCastle:
        this.handleCastle(move);
        break;
      default:
        break;
    }
    return this.preventRecursion
      ? this
      : this.postMoveActions(move);
  };

  postMoveActions = (move) => {
    this.debug('post move actions');
    this.setEnPassantTargetSquare(move);
    this.updateCastlingAvailability(move);
    this.setHalfMoveClock(move);
    this.togglePlayerTurn();
    this.generateMoves();
    this.updateFullMoveNumber(move);
    this.handleMates();
    // this.updateMove(move);
    move = this.updateMove(move);
    this.appendToPgn(move, [...this.legalMoves]);
    this.archiveMove(move);
    this.archiveFen();
    return this;
  };

  setEnPassantTargetSquare = (move) => {
    const isPawn = pieceTypeFromPieceId(move.piece) === pawn;
    const distance = Math.abs(move.toIndex - move.fromIndex);
    const color = pieceColorFromPieceId(move.piece);
    const targetOffset = color === white ? -8 : 8;
    this.enPassantTargetSquare = isPawn && distance === 16
      ? move.toIndex + targetOffset
      : -1;
  };

  updateCastlingAvailability = (move) => {
    if (this.castlingAvailability.length === 0) return;
    const { color, type } = Piece.fromPieceId(move.piece);
    const fromFile = getFile(move.fromIndex);
    if (type === king) {
      this.castlingAvailability = this.castlingAvailability.filter((x) => x.color !== color);
    } else if (type === rook && [0, 7].includes(fromFile)) {
      const side = fromFile === 0 ? queen : king;
      this.castlingAvailability = this.castlingAvailability
        .filter((x) => x.color !== color || x.type !== side);
    }
  };

  setHalfMoveClock = (move) => {
    const isCapture = !!move.capturePiece;
    const isPawn = pieceTypeFromPieceId(move.piece) === pawn;
    this.halfMoveClock = isCapture || isPawn ? 0 : this.halfMoveClock + 1;
  };

  togglePlayerTurn = () => {
    this.activePlayer = this.activePlayer === white
      ? black
      : white;
  };

  generateMoves = () => {
    this.pseudoLegalMoves = getPseudoLegalMoves(this);
    if (this.preventRecursion) return;
    this.legalMoves = getLegalMoves(this);
  };

  updateFullMoveNumber = (move) => {
    const movePieceColor = pieceColorFromPieceId(move.piece);
    if (!this.isResignation) {
      this.currentMoveIndex += 1;
    }
    if (!this.isGameOver && movePieceColor === black) {
      this.fullMoveNumber += 1;
    }
  };

  handleMates = () => {
    if (this.legalMoves.length) return;
    if (this.isCheck) {
      this.isCheckmate = true;
    } else {
      this.isStalemate = true;
    }
  };

  // updateMove = (move) => {
  //   if (this.isCheck) move.isCheck = true;
  //   if (this.isCheckmate) move.isCheckmate = true;
  // };

  updateMove = (move) => {
    const newMove = Move.clone(move);
    if (this.isCheck) newMove.isCheck = true;
    if (this.isCheckmate) newMove.isCheckmate = true;
    return newMove;
  };

  appendToPgn = (move, legalMoves) => {
    this.debug('appendToPgn', { pgn: this.pgn });
    const moveSymbol = PGN.get(move, legalMoves);
    this.pgn = [...this.pgn, moveSymbol];
    if (this.isStalemate) {
      this.pgn.push('½-½ (stalemate)');
    }
  };

  archiveMove = (move) => {
    this.moveHistory.push(move);
  };

  archiveFen = () => {
    this.fenHistory.push(this.fen);
  };

  testForCheck = (color = this.activePlayer) => {
    const playerKing = color | king.id;
    return this.pseudoLegalMoves.some((move) => move.capturePiece === playerKing);
  };

  moveBackward = () => {
    if (this.currentMoveIndex > 0) this.currentMoveIndex -= 1;
    return this;
  };

  moveForward = () => {
    if (this.currentMoveIndex < this.fenHistory.length - 1) this.currentMoveIndex += 1;
    return this;
  };

  moveJump = (moveIndex) => {
    this.currentMoveIndex = moveIndex;
    return this;
  };

  getScore = (color) => this.squares
    .filter((pieceId) => pieceId && pieceColorFromPieceId(pieceId) === color)
    .map((pieceId) => pieceTypeFromPieceId(pieceId).value)
    .reduce((acc, curr) => acc + curr, 0);
}
