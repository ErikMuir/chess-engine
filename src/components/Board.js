import React from 'react';
import {
  ActiveLayer,
  DragLayer,
  InteractiveLayer,
  LabelsLayer,
  PiecesLayer,
  PossibleLayer,
  PreviousLayer,
  SquaresLayer,
} from './board-layers';
import GameOver from './GameOver';
import PawnPromotion from './PawnPromotion';
import PieceType from '../game/PieceType';
import Piece from '../game/Piece';
import Square from '../game/Square';
import { squareSize, boardSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('Board');

class Board extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor');
    const { game } = this.props;
    const squares = this.initSquares(game);
    this.state = {
      game,
      squares,
      activeSquare: null,
      possibleSquares: [],
      previousSquares: [],
      dragPiece: null,
      hoverX: null,
      hoverY: null,
      deselect: false,
      promotionMove: null,
      showGameOverModal: false,
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onClickPawnPromotion = this.onClickPawnPromotion.bind(this);
    this.closeGameOverModal = this.closeGameOverModal.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const { game } = this.state;
    if (game !== prevState.game) {
      this.clearActiveSquare();
      this.clearPossibleSquares();
      this.clearPreviousSquares();
      this.syncSquares();
    }
  }

  static getDerivedStateFromProps(props, state) {
    return props.game === state.game
      ? null
      : { game: props.game };
  }

  getCanvasContext = (canvasId) => {
    logger.trace('getCanvasContext', { canvasId });
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    return canvas.getContext('2d');
  };

  initSquares = (game) => {
    logger.trace('initSquares');
    const squares = new Array(64);
    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        const index = rank * 8 + file;
        const square = new Square(file, rank);
        const pieceValue = game.squares[index];
        square.piece = pieceValue ? Piece.fromPieceValue(pieceValue) : null;
        squares[index] = square;
      }
    }
    return squares;
  };

  syncSquares = () => {
    logger.trace('syncSquares');
    const { game } = this.state;
    this.clearPossibleSquares();
    const { squares } = this.state;
    const newSquares = [...squares];
    for (let i = 0; i < 64; i += 1) {
      const pieceValue = game.squares[i];
      newSquares[i].piece = pieceValue ? Piece.fromPieceValue(pieceValue) : null;
    }
    this.setState({ squares: newSquares });
  };

  onMouseDown = (event) => {
    logger.trace('onMouseDown', { event });
    const { game } = this.state;
    if (game.isGameOver) return;
    const { activeSquare } = this.state;
    const square = this.getEventSquare(event);
    if (square === activeSquare) {
      this.setState({ deselect: true });
    }
    if (square.piece && square.piece.color === game.activePlayer) {
      const dragPiece = square.piece;
      this.initMove(square);
      this.initDrag(dragPiece);
    }
  };

  onMouseUp = (event) => {
    logger.trace('onMouseUp', { event });
    const { activeSquare, dragPiece, deselect } = this.state;
    if (!activeSquare) return;
    if (dragPiece) this.cancelDrag();

    const square = this.getEventSquare(event);
    if (square === activeSquare && deselect) {
      this.clearActiveSquare();
      this.clearPossibleSquares();
      this.setState({ deselect: false });
      return;
    }

    const move = this.getLegalMove(square);

    if (!move) return;

    if (move.isPawnPromotion) {
      this.doPawnPromotion(move);
    } else {
      this.doMove(move);
    }
  };

  onMouseMove = (event) => {
    this.setState({
      hoverX: event.offsetX,
      hoverY: event.offsetY,
    });
  };

  onMouseOut = () => {
    if (this.dragPiece) {
      this.cancelDrag();
      this.clearActiveSquare();
      this.clearPossibleSquares();
    }
  };

  onClickPawnPromotion = (event) => {
    logger.trace('onClickPawnPromotion', { event });
    const { promotionMove } = this.state;
    const index = Math.floor(event.offsetX / squareSize);
    promotionMove.pawnPromotionType = PieceType.promotionTypes[index];
    this.doMove(promotionMove);
    this.setState({ promotionMove: null });
  };

  closeGameOverModal = () => {
    logger.trace('closeGameOverModal');
    this.setState({ showGameOverModal: false });
  };

  getEventSquare = (event) => {
    logger.trace('getEventSquare', { event });
    const { squares } = this.state;
    const rank = 7 - Math.floor(event.offsetY / squareSize);
    const file = Math.floor(event.offsetX / squareSize);
    return squares[rank * 8 + file];
  };

  initDrag = (dragPiece) => {
    logger.trace('initDrag', { dragPiece });
    this.setState({ dragPiece });
  };

  cancelDrag = () => {
    logger.trace('cancelDrag');
    const { activeSquare, dragPiece } = this.state;
    if (activeSquare) {
      activeSquare.piece = dragPiece; // setState did not work as expected here
    }
    this.setState({ dragPiece: null });
  };

  initMove = (fromSquare) => {
    logger.trace('initMove', { fromSquare });
    fromSquare.piece = null;
    this.setPossibleSquares(fromSquare);
    this.setActiveSquare(fromSquare);
  };

  doPawnPromotion = (move) => {
    logger.trace('doPawnPromotion', { move });
    const { game } = this.state;
    // temporarily move pawn to new square
    game.squares[move.fromIndex] = null;
    game.squares[move.toIndex] = move.piece;
    this.syncSquares();
    // trigger the promotion modal
    this.setState({ promotionMove: move });
  };

  doMove = (move) => {
    logger.trace('doMove', { move });
    const { game } = this.state;
    game.doMove(move);
    this.syncSquares();
    game.postMoveActions(move);
    this.setPreviousSquares(move);
    if (game.isGameOver) {
      this.setState({ showGameOverModal: true });
    }
  };

  setActiveSquare = (activeSquare) => {
    logger.trace('setActiveSquare');
    this.setState({ activeSquare });
  };

  clearActiveSquare = () => {
    logger.trace('clearActiveSquare');
    this.setState({ activeSquare: null });
  };

  setPossibleSquares = (fromSquare) => {
    logger.trace('setPossibleSquares');
    const { game, squares } = this.state;
    const possibleSquares = game.legalMoves
      .filter((move) => move.fromIndex === fromSquare.index)
      .map((move) => squares[move.toIndex]);
    this.setState({ possibleSquares });
  };

  clearPossibleSquares = () => {
    logger.trace('clearPossibleSquares');
    this.setState({ possibleSquares: [] });
  };

  setPreviousSquares = (move) => {
    logger.trace('setPreviousSquares', { move });
    const { squares } = this.state;
    const previousSquares = [
      squares[move.fromIndex],
      squares[move.toIndex],
    ];
    this.setState({ previousSquares });
  };

  clearPreviousSquares = () => {
    logger.trace('clearPreviousSquares');
    this.setState({ previousSquares: [] });
  };

  getLegalMove = (toSquare) => {
    logger.trace('getLegalMove', { toSquare });
    const { activeSquare, game } = this.state;
    return game.legalMoves
      .find((move) => move.fromIndex === activeSquare.index
        && move.toIndex === toSquare.index);
  };

  getDragLayer = () => {
    const { dragPiece, hoverX, hoverY } = this.state;
    return dragPiece
      ? (
        <DragLayer
          dragPiece={dragPiece}
          hoverX={hoverX}
          hoverY={hoverY}
        />
      ) : null;
  };

  getPromotionModal = () => {
    const { game, promotionMove } = this.state;
    return promotionMove
      ? (
        <PawnPromotion
          activePlayer={game.activePlayer}
          onClick={this.onClickPawnPromotion}
        />
      ) : null;
  };

  getGameOverModal = () => {
    const { game, showGameOverModal } = this.state;
    return showGameOverModal
      ? (
        <GameOver
          game={game}
          closeGameOverModal={this.closeGameOverModal}
        />
      ) : null;
  };

  render() {
    const {
      squares,
      previousSquares,
      activeSquare,
      possibleSquares,
    } = this.state;
    const width = boardSize;
    const height = boardSize;

    return (
      <main className="app-main">
        <div className="canvas-container" style={{ width, height }}>
          <SquaresLayer squares={squares} />
          <LabelsLayer squares={squares} />
          <PreviousLayer previousSquares={previousSquares} />
          <ActiveLayer activeSquare={activeSquare} />
          <PiecesLayer squares={squares} />
          <PossibleLayer possibleSquares={possibleSquares} />
          {this.getDragLayer()}
          <InteractiveLayer
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onMouseMove={this.onMouseMove}
            onMouseOut={this.onMouseOut}
          />
        </div>
        {this.getPromotionModal()}
        {this.getGameOverModal()}
      </main>
    );
  }
}

export default Board;
