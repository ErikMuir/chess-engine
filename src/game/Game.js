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
const schema = '0.1.1';

export default class Game {
  constructor({
    fen = startPosition,
    playerColor = PieceColor.white,
    preventRecursion = false,
  } = {}) {
    if (!preventRecursion) logger.trace('ctor');
    this.initProps(playerColor, preventRecursion);
    FEN.load(fen, this);
    this.archiveFen();
    this.generateMoves();
  }

  initProps = (playerColor, preventRecursion) => {
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
    this.pgn = [];
    this.moveHistory = [];
    this.fenHistory = [];
    this.isCheckmate = false;
    this.isStalemate = false;
    this.isResignation = false;
    this.isDraw = false;
    this.tempMove = null;
    this.confirmationDisabled = false;
  };

  trace = (msg) => {
    if (this.preventRecursion) return;
    logger.trace(msg);
  };

  get isGameOver() {
    this.trace('isGameOver');
    return this.isCheckmate || this.isStalemate || this.isResignation || this.isDraw;
  }

  get isCheck() {
    this.trace('isCheck');
    const king = this.activePlayer | PieceType.king;
    return this.pseudoLegalMoves.some((move) => move.capturePiece === king);
  }

  get game() {
    this.trace('game');
    return {
      schema,
      playerColor: this.playerColor,
      fen: FEN.get(this),
      moves: this.moveHistory.map((move) => ({ ...move })),
      pgn: [...this.pgn],
    };
  }

  get json() {
    this.trace('json');
    return JSON.stringify(this.game, null, 2);
  }

  resign = () => {
    this.trace('resign');
    this.isResignation = true;
    const msg = this.activePlayer === PieceColor.white
      ? '0-1 (white resigns)'
      : '1-0 (black resigns)';
    this.pgn.push(msg);
  };

  getMovePiece = (move) => {
    this.trace('getMovePiece');
    return move.isPawnPromotion
      ? this.activePlayer | move.pawnPromotionType
      : move.piece;
  };

  handleEnPassant = (move) => {
    this.trace('handleEnPassant');
    const offset = PieceColor.fromPieceValue(move.piece) === PieceColor.white ? -8 : 8;
    const captureSquareIndex = move.toIndex + offset;
    this.squares[captureSquareIndex] = undefined;
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
    this.squares[fromIndex] = undefined;
  };

  doMove = (move) => {
    this.trace('doMove');
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
    this.handleMates();
    this.updateMove(move);
    this.appendToPgn(move, legalMoves);
    this.archiveMove(move);
    this.archiveFen();
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
    if (this.isCheck) move.isCheck = true;
    if (this.isCheckmate) move.isCheckmate = true;
  };

  archiveMove = (move) => {
    this.trace('archiveMove');
    this.moveHistory.push(move);
  };

  archiveFen = () => {
    this.trace('archiveFen');
    const fen = FEN.get(this);
    this.fenHistory.push(fen);
  };

  appendToPgn = (move, legalMoves) => {
    this.trace('appendToPgn');
    const moveSymbol = PGN.get(move, legalMoves);
    this.pgn.push(moveSymbol);
    if (this.isStalemate) {
      this.pgn.push('½-½ (stalemate)');
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
    if (this.currentMoveIndex < this.fenHistory.length - 1) this.currentMoveIndex += 1;
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
