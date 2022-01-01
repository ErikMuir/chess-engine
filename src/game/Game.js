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
    playerColor = PieceColor.white,
    preventRecursion = false,
  } = {}) {
    if (!preventRecursion) logger.trace('ctor');
    this.initProps(pgn, playerColor, preventRecursion);
    FEN.load(fen, this);
    this.populateHistory();
    this.generateMoves();
  }

  initProps = (pgn, playerColor, preventRecursion) => {
    this.pgn = pgn;
    this.playerColor = playerColor;
    this.preventRecursion = preventRecursion;
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
    this.gameHistory = [];
    this.isResignation = false;
    this.tempMove = null;
    this.confirmationDisabled = false;
  };

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

  get game() {
    this.trace('game');
    return {
      schema,
      fen: FEN.get(this),
      pgn: this.pgn.map((pgn) => ({ ...pgn })),
    };
  }

  get json() {
    this.trace('json');
    return JSON.stringify(this.game, null, 2);
  }

  populateHistory = () => {
    this.archiveGame();
    if (this.preventRecursion || !this.pgn.length) return;

    let workingGame = new Game({ ...this.game, preventRecursion: true });

    function parseMove(pgn, pieceColor) {
      // TODO : parse move
    }

    function appendHistory(move) {
      // TODO : append to moveHistory
      // TODO : doMove
      // TODO : append to gameHistory
    }

    for (let i = 0; i < this.pgn.length; i += 1) {
      const { white, black, score } = this.pgn[i];
      if (white) {
        const move = parseMove(white, PieceColor.white);
        appendHistory(move);
      }
      if (black) {
        const move = parseMove(black, PieceColor.black);
        appendHistory(move);
      }
      if (score) {
        if (score.includes('resign')) this.isResignation = true;
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

  doMove = (move) => {
    this.trace('doMove');
    this.squares[move.fromIndex] = null;
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
    if (!this.preventRecursion) {
      this.postMoveActions(move);
    }
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
    this.archiveGame();
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
      this.currentMoveIndex += 1;
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

  archiveGame = () => {
    this.trace('archiveGame');
    this.gameHistory.push(this.game);
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
    if (this.currentMoveIndex > 0) this.currentMoveIndex -= 1;
  };

  moveForward = () => {
    this.trace('moveForward');
    if (this.currentMoveIndex < this.gameHistory.length - 1) this.currentMoveIndex += 1;
  };

  moveJump = (moveIndex) => {
    this.trace('moveJump');
    this.currentMoveIndex = moveIndex;
  };

  confirmMove = () => {
    this.trace('confirmMove');
    if (this.tempMove) {
      this.doMove(this.tempMove);
      this.tempMove = null;
    }
  };

  cancelMove = () => {
    this.trace('cancelMove');
    this.tempMove = null;
  };
}
