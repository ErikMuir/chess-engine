import PieceColor from './PieceColor';
import PieceType from './PieceType';
import Piece from './Piece';
import Square from './Square';
import { squareSize } from './constants';
import { proportion } from './utils';

export default class Board {
  constructor(game) {
    this.game = game;
    this.squares = new Array(64);

    this.ctx = null;
    this.ppCtx = null;
    this.activeSquare = null;
    this.possibleSquares = [];
    this.previousMove = {};
    this.dragPiece = null;
    this.deselect = false;
    this.promotionMove = null;
    this.promotionTypes = [
      PieceType.queen,
      PieceType.rook,
      PieceType.bishop,
      PieceType.knight,
    ];

    this.initSquares();
  }

  initSquares = () => {
    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        const index = rank * 8 + file;
        const square = new Square(file, rank, this);
        const pieceValue = this.game.squares[index];
        square.piece = pieceValue ? Piece.fromPieceValue(pieceValue) : null;
        this.squares[index] = square;
      }
    }
  };

  refresh = () => {
    this.clearPossibleSquares();
    for (let i = 0; i < 64; i += 1) {
      const pieceValue = this.game.squares[i];
      this.squares[i].piece = pieceValue ? Piece.fromPieceValue(pieceValue) : null;
    }
  };

  draw = () => {
    this.squares.forEach((sq) => sq.draw(this.ctx));
    this.drawDragPiece(this.ctx);
  };

  drawDragPiece = (ctx) => {
    if (!this.dragPiece) return;
    const size = proportion(0.8);
    const x = this.hoverX - (size / 2);
    const y = this.hoverY - (size / 2);
    this.dragPiece.getImage()
      .then((img) => ctx.drawImage(img, x, y, size, size));
  };

  onMouseDown = (e) => {
    if (this.game.isGameOver) return;
    const square = this.getEventSquare(e);
    if (square === this.activeSquare) {
      this.deselect = true;
    }
    if (square.piece && square.piece.color === this.game.activePlayer) {
      this.initDrag(square);
      this.initMove(square);
      this.setHover(e);
    }
  };

  onMouseUp = (e) => {
    if (!this.activeSquare) return;
    if (this.dragPiece) this.cancelDrag();

    const square = this.getEventSquare(e);
    if (square === this.activeSquare && this.deselect) {
      this.clearActiveSquare();
      this.clearPossibleSquares();
      this.deselect = false;
      return;
    }

    const move = this.getLegalMove(square);

    if (!move) return;

    if (move.isPawnPromotion) {
      this.showPawnPromotionModal(move);
    } else {
      this.doMove(move);
    }
  };

  onMouseMove = (e) => {
    this.setHover(e);
  };

  onMouseOut = () => {
    if (this.dragPiece) {
      this.cancelDrag();
      this.clearActiveSquare();
      this.clearPossibleSquares();
    }
  };

  setHover = (e) => {
    this.hoverX = e.offsetX;
    this.hoverY = e.offsetY;
  };

  getEventSquare = (e) => {
    const rank = 7 - Math.floor(e.offsetY / squareSize);
    const file = Math.floor(e.offsetX / squareSize);
    return this.squares[rank * 8 + file];
  };

  initDrag = (fromSquare) => {
    this.dragPiece = fromSquare.piece;
  };

  cancelDrag = () => {
    if (this.activeSquare) {
      this.activeSquare.piece = this.dragPiece;
    }
    this.dragPiece = null;
  };

  initMove = (fromSquare) => {
    fromSquare.piece = null;
    this.activeSquare = fromSquare;
    this.possibleSquares = this.game.legalMoves
      .filter((move) => move.fromIndex === fromSquare.index)
      .map((move) => move.toIndex);
  };

  doMove = (move) => {
    this.game.doMove(move);
    this.refresh();
    this.game.postMoveActions(move);
    this.setPreviousMove(move);
    if (this.game.isGameOver) {
      this.showGameOverModal();
    }
  };

  clearActiveSquare = () => {
    this.activeSquare = null;
  };

  clearPossibleSquares = () => {
    this.possibleSquares = [];
  };

  setPreviousMove = (move) => {
    this.previousMove = move;
  };

  getLegalMove = (toSquare) => this.game.legalMoves
    .find((move) => move.fromIndex === this.activeSquare.index
      && move.toIndex === toSquare.index);

  showGameOverModal = () => {
    const title = this.game.isCheckmate ? 'Checkmate' : 'Stalemate';
    const message = this.game.isCheckmate ? this.getCheckmateMessage() : this.getStalemateMessage();
    document.getElementById('game-over-modal-title').innerHTML = title;
    document.getElementById('game-over-modal-message').innerHTML = message;
    document.getElementById('game-over-modal-moves').innerHTML = this.game.getPgn();
    // MicroModal.show('game-over-modal');
  };

  getCheckmateMessage = () => {
    const winner = PieceColor.toString(PieceColor.opposite(this.game.activePlayer));
    const loser = PieceColor.toString(this.game.activePlayer);
    const moveCount = this.game.fullMoveNumber;
    return `${winner} mated ${loser} in ${moveCount} moves.`;
  };

  getStalemateMessage = () => {
    const activePlayer = PieceColor.toString(this.game.activePlayer);
    return `${activePlayer} is not in check but has no legal moves, therefore it is a draw.`;
  };

  showPawnPromotionModal = (move) => {
    this.promotionMove = move;
    const color = this.game.activePlayer;
    const offset = proportion(0.1);
    const size = proportion(0.8);
    this.promotionTypes.forEach((type, index) => {
      const x = (squareSize * index) + offset;
      const y = offset;
      const piece = new Piece(color, type);
      piece.getImage()
        .then((img) => this.ppCtx.drawImage(img, x, y, size, size));
    });
    // MicroModal.show('pawn-promotion-modal');
  };

  onPawnPromotionChoice = (e) => {
    const index = Math.floor(e.offsetX / squareSize);
    const move = this.promotionMove;
    move.pawnPromotionType = this.promotionTypes[index];
    // MicroModal.close('pawn-promotion-modal');
    this.doMove(move);
    this.promotionMove = null;
  };
}
