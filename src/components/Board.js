import React from 'react';
import CanvasContainer from './CanvasContainer';
import PawnPromotionModal from './PawnPromotionModal';
import Game from '../game/Game';
import PieceColor from '../game/PieceColor';
import Piece from '../game/Piece';
import Square from '../game/Square';
import { proportion } from '../game/utils';
import {
  squareSize,
  boardSize,
  // startPosition,
  testFEN,
  activeOverlay,
  previousOverlay,
  possibleOverlay,
  overlayOpacity,
} from '../game/constants';

const boardCanvasId = 'canvas-chess-board';

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.game = new Game({ fen: testFEN.promotion });
    this.state = {
      squares: this.initSquares(),
      ctx: null,
      activeSquare: null,
      possibleSquares: [],
      previousMove: {},
      dragPiece: null,
      deselect: false,
      promotionMove: null,
    };
    this.draw = this.draw.bind(this);
  }

  componentDidMount() {
    const boardCanvas = document.getElementById(boardCanvasId);
    boardCanvas.width = boardSize;
    boardCanvas.height = boardSize;
    boardCanvas.onmousedown = this.onMouseDown;
    boardCanvas.onmouseup = this.onMouseUp;
    boardCanvas.onmousemove = this.onMouseMove;
    boardCanvas.onmouseout = this.onMouseOut;
    const ctx = boardCanvas.getContext('2d');
    this.setState({ ctx });
  }

  initSquares = () => {
    const squares = new Array(64);
    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        const index = rank * 8 + file;
        const square = new Square(file, rank);
        const pieceValue = this.game.squares[index];
        square.piece = pieceValue ? Piece.fromPieceValue(pieceValue) : null;
        squares[index] = square;
      }
    }
    return squares;
  };

  refresh = () => {
    this.clearPossibleSquares();
    const { squares } = this.state;
    const newSquares = [...squares];
    for (let i = 0; i < 64; i += 1) {
      const pieceValue = this.game.squares[i];
      newSquares[i].piece = pieceValue ? Piece.fromPieceValue(pieceValue) : null;
    }
    this.setState({ squares: newSquares });
  };

  draw = () => {
    const { squares } = this.state;
    squares.forEach((sq) => this.drawSquare(sq));
    this.drawDragPiece();
  };

  drawSquare = (square) => {
    const { ctx, previousMove, possibleSquares } = this.state;
    if (!ctx) return;

    this.drawBackground(square, ctx);

    if (square.file === 0) {
      this.drawRankLabel(square, ctx);
    }

    if (square.rank === 0) {
      this.drawFileLabel(square, ctx);
    }

    if (square === this.activeSquare) {
      this.drawActiveOverlay(square, ctx);
    }

    if (previousMove
      && [previousMove.fromIndex, previousMove.toIndex].includes(square.index)
    ) {
      this.drawPreviousOverlay(square, ctx);
    }

    if (square.piece) {
      this.drawPiece(square, ctx);
    }

    if (possibleSquares.includes(square.index)) {
      this.drawPossibleOverlay(square, ctx);
    }
  };

  drawBackground = (square, ctx) => {
    ctx.fillStyle = square.squareColor;
    ctx.fillRect(square.xPos, square.yPos, squareSize, squareSize);
  };

  drawRankLabel = (square, ctx) => {
    const rankText = `${square.rank + 1}`;
    const x = square.xPos + proportion(0.05);
    const y = square.yPos + proportion(0.2);
    ctx.fillStyle = square.textColor;
    ctx.font = `400 ${proportion(0.175)}px sans-serif`;
    ctx.fillText(rankText, x, y);
  };

  drawFileLabel = (square, ctx) => {
    const fileText = 'abcdefgh'[square.file];
    const x = square.xPos + squareSize - proportion(0.15);
    const y = square.yPos + squareSize - proportion(0.075);
    ctx.fillStyle = square.textColor;
    ctx.font = `400 ${proportion(0.175)}px sans-serif`;
    ctx.fillText(fileText, x, y);
  };

  drawActiveOverlay = (square, ctx) => {
    ctx.fillStyle = activeOverlay;
    ctx.globalAlpha = overlayOpacity;
    ctx.fillRect(square.xPos, square.yPos, squareSize, squareSize);
    ctx.globalAlpha = 1.0;
  };

  drawPreviousOverlay = (square, ctx) => {
    ctx.fillStyle = previousOverlay;
    ctx.globalAlpha = overlayOpacity;
    ctx.fillRect(square.xPos, square.yPos, squareSize, squareSize);
    ctx.globalAlpha = 1.0;
  };

  drawPossibleOverlay = (square, ctx) => {
    if (this.piece) {
      this.drawPossibleOverlayOccupied(square, ctx);
    } else {
      this.drawPossibleOverlayEmpty(square, ctx);
    }
  };

  drawPossibleOverlayEmpty = (square, ctx) => {
    const offset = proportion(0.5);
    const radius = proportion(0.17);
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(square.xPos + offset, square.yPos + offset, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = possibleOverlay;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  };

  drawPossibleOverlayOccupied = (square, ctx) => {
    const offset = proportion(0.5);
    const radius = proportion(0.46);
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(square.xPos + offset, square.yPos + offset, radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 7;
    ctx.strokeStyle = possibleOverlay;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  };

  drawPiece = (square, ctx) => {
    const offset = proportion(0.1);
    const size = proportion(0.8);
    const x = square.xPos + offset;
    const y = square.yPos + offset;
    square.piece.getImage()
      .then((img) => ctx.drawImage(img, x, y, size, size));
  };

  drawDragPiece = () => {
    const {
      dragPiece, hoverX, hoverY, ctx,
    } = this.state;
    if (!dragPiece) return;
    const size = proportion(0.8);
    const x = hoverX - (size / 2);
    const y = hoverY - (size / 2);
    dragPiece.getImage()
      .then((img) => ctx.drawImage(img, x, y, size, size));
  };

  onMouseDown = (e) => {
    if (this.game.isGameOver) return;
    const square = this.getEventSquare(e);
    const { activeSquare } = this.state;
    if (square === activeSquare) {
      this.setState({ deselect: true });
    }
    if (square.piece && square.piece.color === this.game.activePlayer) {
      this.initDrag(square);
      this.initMove(square);
      this.setHover(e);
    }
  };

  onMouseUp = (e) => {
    const { activeSquare, dragPiece, deselect } = this.state;
    if (!activeSquare) return;
    if (dragPiece) this.cancelDrag();

    const square = this.getEventSquare(e);
    if (square === activeSquare && deselect) {
      this.clearActiveSquare();
      this.clearPossibleSquares();
      this.setState({ deselect: false });
      return;
    }

    const move = this.getLegalMove(square);

    if (!move) return;

    if (move.isPawnPromotion) {
      const promotionMove = move;
      this.setState({ promotionMove });
      console.log('this triggers the modal', { promotionMove });
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
    this.setState({
      hoverX: e.offsetX,
      hoverY: e.offsetY,
    });
  };

  getEventSquare = (e) => {
    const { squares } = this.state;
    const rank = 7 - Math.floor(e.offsetY / squareSize);
    const file = Math.floor(e.offsetX / squareSize);
    return squares[rank * 8 + file];
  };

  initDrag = (fromSquare) => {
    this.setState({ dragPiece: fromSquare.piece });
  };

  cancelDrag = () => {
    const { activeSquare, dragPiece } = this.state;
    if (activeSquare) {
      activeSquare.piece = dragPiece; // setState did not work as expected here
    }
    this.setState({ dragPiece: null });
  };

  initMove = (fromSquare) => {
    fromSquare.piece = null;
    const possibleSquares = this.game.legalMoves
      .filter((move) => move.fromIndex === fromSquare.index)
      .map((move) => move.toIndex);
    this.setState({
      activeSquare: fromSquare,
      possibleSquares,
    });
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
    this.setState({ activeSquare: null });
  };

  clearPossibleSquares = () => {
    this.setState({ possibleSquares: [] });
  };

  setPreviousMove = (move) => {
    this.setState({ previousMove: move });
  };

  getLegalMove = (toSquare) => {
    const { activeSquare } = this.state;
    return this.game.legalMoves
      .find((move) => move.fromIndex === activeSquare.index
        && move.toIndex === toSquare.index);
  }

  showGameOverModal = () => {
    // TODO : change from MicroModal to react-modal
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

  render() {
    const { promotionMove } = this.state;
    return (
      <>
        <CanvasContainer
          canvasId={boardCanvasId}
          draw={this.draw}
          width={boardSize}
          height={boardSize}
        />
        {promotionMove && <PawnPromotionModal board={null} />}
      </>
    );
  }
}

export default Board;
