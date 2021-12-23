import React from 'react';
import ActiveLayer from './board-layers/ActiveLayer';
import InteractiveLayer from './board-layers/InteractiveLayer';
import LabelsLayer from './board-layers/LabelsLayer';
import PiecesLayer from './board-layers/PiecesLayer';
import PossibleLayer from './board-layers/PossibleLayer';
import PreviousLayer from './board-layers/PreviousLayer';
import SquaresLayer from './board-layers/SquaresLayer';
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
      deselect: false,
      promotionMove: null,
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onClickPawnPromotion = this.onClickPawnPromotion.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const { game } = this.state;
    const { forceBoardRefresh } = this.props;
    const isNewGame = game !== prevState.game;
    const isForceRefresh = forceBoardRefresh !== prevProps.forceBoardRefresh;
    if (isNewGame || isForceRefresh) {
      logger.trace('componentDidUpdate');
      this.clearActiveSquare();
      this.clearPossibleSquares();
      this.clearPreviousSquares();
      this.syncSquares();
    }
    if (isForceRefresh) {
      const previousMove = game.moveHistory[game.moveHistory.length - 1];
      this.setPreviousSquares(previousMove);
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { game } = props;
    return game === state.game ? null : { game };
  }

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
    logger.trace('onMouseDown');
    const { game } = this.state;
    if (game.isGameOver || game.tempMove) return;
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
    logger.trace('onMouseUp');
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

    this.doTempMove(move);

    const { updateApp } = this.props;
    const { game } = this.state;
    updateApp(game);

    if (move.isPawnPromotion) {
      game.tempMove = null;
      this.doPawnPromotion(move);
    }
  };

  onMouseOut = () => {
    if (this.dragPiece) {
      logger.trace('onMouseOut');
      this.cancelDrag();
      this.clearActiveSquare();
      this.clearPossibleSquares();
    }
  };

  onClickPawnPromotion = (event) => {
    logger.trace('onClickPawnPromotion');
    const { promotionMove } = this.state;
    const index = Math.floor(event.offsetX / squareSize);
    promotionMove.pawnPromotionType = PieceType.promotionTypes[index];
    this.doMove(promotionMove);
    this.setState({ promotionMove: null });
  };

  getEventSquare = (event) => {
    logger.trace('getEventSquare');
    const { squares } = this.state;
    const rank = 7 - Math.floor(event.offsetY / squareSize);
    const file = Math.floor(event.offsetX / squareSize);
    return squares[rank * 8 + file];
  };

  initDrag = (dragPiece) => {
    logger.trace('initDrag');
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
    logger.trace('initMove');
    fromSquare.piece = null;
    this.setPossibleSquares(fromSquare);
    this.setActiveSquare(fromSquare);
  };

  doTempMove = (move) => {
    logger.trace('doTempMove');
    const { game, squares } = this.state;
    const newSquares = [...squares];
    newSquares[move.fromIndex].piece = null;
    newSquares[move.toIndex].piece = Piece.fromPieceValue(move.piece);
    this.setState({ squares: newSquares });
    game.tempMove = move;
    this.clearPossibleSquares();
    this.clearActiveSquare();
    this.setPreviousSquares(move);
  };

  doPawnPromotion = (move) => {
    logger.trace('doPawnPromotion');
    this.setState({ promotionMove: move });
  };

  doMove = (move) => {
    logger.trace('doMove');
    const { game } = this.state;
    const { updateApp } = this.props;
    game.doMove(move);
    this.syncSquares();
    game.postMoveActions(move);
    updateApp(game);
    this.setPreviousSquares(move);
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
    logger.trace('setPreviousSquares');
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
    logger.trace('getLegalMove');
    const { activeSquare, game } = this.state;
    return game.legalMoves
      .find((move) => move.fromIndex === activeSquare.index
        && move.toIndex === toSquare.index);
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

  render() {
    logger.trace('render');
    const {
      squares,
      previousSquares,
      activeSquare,
      possibleSquares,
      dragPiece,
    } = this.state;
    const width = boardSize;
    const height = boardSize;
    const flexBasis = boardSize;

    return (
      <>
        <div className="board canvas-container" style={{ width, height, flexBasis }}>
          <SquaresLayer squares={squares} />
          <LabelsLayer squares={squares} />
          <PreviousLayer previousSquares={previousSquares} />
          <ActiveLayer activeSquare={activeSquare} />
          <PiecesLayer squares={squares} />
          <PossibleLayer possibleSquares={possibleSquares} />
          <InteractiveLayer
            dragPiece={dragPiece}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onMouseOut={this.onMouseOut}
          />
        </div>
        {this.getPromotionModal()}
      </>
    );
  }
}

export default Board;
