import CurrentMove from './CurrentMove';
import FEN from './FEN';
import MoveType from './MoveType';
import PGN from './PGN';
import Piece from './Piece';
import PieceColor from './PieceColor';
import PieceType from './PieceType';
import { generatePseudoLegalMoves } from './moveGeneration';
import { getFile, startPosition } from './utils';
import Logger from '../Logger';

const logger = new Logger('Game');
const schema = '1.0.0';

export default class Game {
  constructor({
    fen = startPosition,
    pgn = [],
    preventRecursion = false,
  } = {}) {
    if (!preventRecursion) logger.trace('ctor');
    this.squares = new Array(64);
    this.numSquaresToEdge = new Array(64);
    this.activePlayer = null;
    this.isCapture = false;
    this.enPassantTargetSquare = null;
    this.castlingAvailability = [];
    this.halfMoveClock = null;
    this.fullMoveNumber = null;
    this.currentMove = null;
    this.pseudoLegalMoves = [];
    this.legalMoves = [];
    this.moveHistory = [];
    this.pgn = pgn;
    this.preventRecursion = preventRecursion;
    this.isResignation = false;
    this.tempMove = null;

    FEN.load(fen, this);
    this.init();
    this.generateMoves();
  }

  trace = (msg) => {
    if (this.preventRecursion) return;
    logger.trace(msg);
  };

  get isGameOver() {
    this.trace('isGameOver');
    return this.legalMoves.length === 0;
  }

  get isCheck() {
    this.trace('isCheck');
    const king = this.activePlayer | PieceType.king;
    return this.pseudoLegalMoves.some((move) => move.capturePiece === king);
  }

  get isCheckmate() {
    this.trace('isCheckmate');
    return this.isGameOver && this.isCheck;
  }

  get json() {
    this.trace('json');
    return JSON.stringify({
      schema,
      fen: FEN.get(this),
      pgn: this.pgn,
    }, null, 2);
  }

  init = () => {
    this.trace('init');

    this.currentMove = new CurrentMove(
      this.pgn.length,
      PieceColor.opposite(this.activePlayer),
    );

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

  resign = () => {
    this.trace('resign');
    this.isResignation = true;
    this.legalMoves = [];
    if (this.activePlayer === PieceColor.white) {
      this.pgn.push({ score: '0-1 (white resigns)' });
    } else {
      this.pgn[this.pgn.length - 1].score = '1-0 (black resigns)';
    }
  };

  doMove = (move) => {
    this.trace('doMove');
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
    if (!this.preventRecursion) {
      this.postMoveActions(move);
    }
  };

  getMovePiece = (move) => {
    this.trace('getMovePiece');
    if (!move.isPawnPromotion) return move.piece;
    return this.activePlayer | move.pawnPromotionType;
  };

  handleEnPassant = (move) => {
    this.trace('handleEnPassant');
    const offset = PieceColor.fromPieceValue(move.piece) === PieceColor.white ? -8 : 8;
    const captureSquareIndex = move.toIndex + offset;
    this.squares[captureSquareIndex] = null;
  };

  handleCastle = (move) => {
    this.trace('handleCastle');
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
    this.trace('postMoveActions');
    const legalMoves = [...this.legalMoves];
    this.setEnPassantTargetSquare(move);
    this.updateCastlingAvailability(move);
    this.setHalfMoveClock(move);
    this.togglePlayerTurn();
    this.generateMoves();
    this.updateFullMoveNumber(move);
    this.updateMove(move);
    this.appendToPgn(move, legalMoves);
    this.archiveMove(move);
  };

  setEnPassantTargetSquare = (move) => {
    this.trace('setEnPassantTargetSquare');
    const isPawn = PieceType.fromPieceValue(move.piece) === PieceType.pawn;
    const distance = Math.abs(move.toIndex - move.fromIndex);
    const color = PieceColor.fromPieceValue(move.piece);
    const targetOffset = color === PieceColor.white ? -8 : 8;
    this.enPassantTargetSquare = isPawn && distance === 16
      ? move.toIndex + targetOffset
      : -1;
  };

  updateCastlingAvailability = (move) => {
    this.trace('updateCastlingAvailability');
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
    this.trace('setMoveClock');
    const isCapture = !!move.capturePiece;
    const isPawn = PieceType.fromPieceValue(move.piece) === PieceType.pawn;
    this.halfMoveClock = isCapture || isPawn ? 0 : this.halfMoveClock + 1;
  };

  togglePlayerTurn = () => {
    this.trace('togglePlayerTurn');
    this.activePlayer = this.activePlayer === PieceColor.white
      ? PieceColor.black
      : PieceColor.white;
  };

  updateFullMoveNumber = (move) => {
    this.trace('updateFullMoveNumber');
    const movePieceColor = PieceColor.fromPieceValue(move.piece);
    if (!this.isResignation) {
      this.currentMove = new CurrentMove(
        Math.floor(this.fullMoveNumber),
        movePieceColor,
      );
    }
    if (!this.isGameOver && movePieceColor === PieceColor.black) {
      this.fullMoveNumber += 1;
    }
  };

  updateMove = (move) => {
    this.trace('updateMove');
    move.isCheck = this.isCheck;
    move.isCheckmate = this.isCheckmate;
  };

  archiveMove = (move) => {
    this.trace('archiveMove');
    this.moveHistory.push(move);
  };

  appendToPgn = (move, legalMoves) => {
    this.trace('appendToPgn');
    const pgn = PGN.get(move, legalMoves);
    if (PieceColor.fromPieceValue(move.piece) === PieceColor.white) {
      this.pgn.push({ white: pgn });
    } else {
      this.pgn[this.pgn.length - 1].black = pgn;
    }
  };

  generateMoves = () => {
    this.trace('generateMoves');
    this.pseudoLegalMoves = generatePseudoLegalMoves(this);
    if (this.preventRecursion) return;
    this.legalMoves = this.generateLegalMoves();
  };

  generateLegalMoves = () => {
    this.trace('generateLegalMoves');
    const activePlayerMoves = this.pseudoLegalMoves
      .filter((move) => PieceColor.fromPieceValue(move.piece) === this.activePlayer);
    if (this.preventRecursion) return activePlayerMoves;
    const fen = FEN.get(this);
    const moves = [];
    activePlayerMoves.forEach((move) => {
      const futureGame = new Game({ fen, preventRecursion: true });
      futureGame.doMove(move);
      futureGame.pseudoLegalMoves = generatePseudoLegalMoves(futureGame);
      const isCheck = futureGame.testForCheck(this.activePlayer);
      if (!isCheck) moves.push(move);
    });
    return moves;
  };

  testForCheck = (color = this.activePlayer) => {
    this.trace('testForCheck');
    const king = color | PieceType.king;
    return this.pseudoLegalMoves.some((move) => move.capturePiece === king);
  };

  moveBackward = () => {
    this.trace('moveBackward');
    const { moveNumber, pieceColor } = this.currentMove;
    const newMoveNumber = pieceColor === PieceColor.white ? moveNumber - 1 : moveNumber;
    const newPieceColor = PieceColor.opposite(pieceColor);
    if (newMoveNumber < 0) return;
    this.currentMove = new CurrentMove(newMoveNumber, newPieceColor);
  };

  moveForward = () => {
    this.trace('moveForward');
    const { moveNumber, pieceColor } = this.currentMove;
    const newMoveNumber = pieceColor === PieceColor.white ? moveNumber : moveNumber + 1;
    const newPieceColor = pieceColor === PieceColor.none
      ? PieceColor.white
      : PieceColor.opposite(pieceColor);
    if (newMoveNumber > this.pgn.length) return;
    const newMove = this.pgn[newMoveNumber - 1];
    if (newMove.score && newPieceColor === PieceColor.white && !newMove.white) return;
    if (newMove.score && newPieceColor === PieceColor.black && !newMove.black) return;
    this.currentMove = new CurrentMove(newMoveNumber, newPieceColor);
  };

  confirmMove = () => {
    this.trace('confirmMove');
    const move = { ...this.tempMove };
    if (move) {
      this.tempMove = null;
      this.doMove(move);
    }
  };

  cancelMove = () => {
    this.trace('cancelMove');
    this.tempMove = null;
  };
}
