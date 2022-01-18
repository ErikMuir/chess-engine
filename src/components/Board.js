import React from 'react';
import CapturedPieces from './CapturedPieces';
import ActiveLayer from './board-layers/ActiveLayer';
import InteractiveLayer from './board-layers/InteractiveLayer';
import LabelsLayer from './board-layers/LabelsLayer';
import PiecesLayer from './board-layers/PiecesLayer';
import PossibleLayer from './board-layers/PossibleLayer';
import PreviousLayer from './board-layers/PreviousLayer';
import SquaresLayer from './board-layers/SquaresLayer';
import PawnPromotion from './PawnPromotion';
import Game from '../game/Game';
import MoveType from '../game/MoveType';
import { white, pieceColorFromPieceId } from '../game/PieceColors';
import { promotionTypes } from '../game/PieceTypes';
import Piece from '../game/Piece';
import Square from '../game/Square';
import { squareSize, boardSize, getFile } from '../game/utils';
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

  componentDidUpdate(prevProps) {
    const { forceRefresh } = this.props;
    const isForceRefresh = forceRefresh !== prevProps.forceRefresh;
    if (isForceRefresh) {
      this.forceRefresh();
      this.syncSquares();
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { game } = props;
    return game === state.game ? null : { game };
  }

  forceRefresh = () => {
    const { game, squares } = this.state;
    const { currentMoveIndex, moveHistory } = game;
    const previousSquares = [];
    if (currentMoveIndex > 0) {
      const previousMove = moveHistory[currentMoveIndex - 1];
      previousSquares.push(squares[previousMove.fromIndex]);
      previousSquares.push(squares[previousMove.toIndex]);
    }
    this.setState({
      activeSquare: null,
      possibleSquares: [],
      previousSquares,
    });
  };

  initSquares = (game) => {
    logger.trace('initSquares');
    const squares = new Array(64);
    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        const index = rank * 8 + file;
        const square = new Square(file, rank);
        const pieceId = game.squares[index];
        square.piece = pieceId ? Piece.fromPieceId(pieceId) : null;
        squares[index] = square;
      }
    }
    return squares;
  };

  syncSquares = () => {
    logger.trace('syncSquares');
    const { game, squares } = this.state;
    const { currentMoveIndex, fenHistory } = game;
    const currentGame = new Game({ fen: fenHistory[currentMoveIndex] });
    const newSquares = [...squares];
    for (let i = 0; i < 64; i += 1) {
      const pieceId = currentGame.squares[i];
      newSquares[i].piece = pieceId ? Piece.fromPieceId(pieceId) : null;
    }
    this.setState({ squares: newSquares, possibleSquares: [] });
  };

  onMouseDown = (event) => {
    logger.trace('onMouseDown');
    const { game, squares } = this.state;
    if (game.isGameOver || game.tempMove || game.activePlayer !== game.playerColor) return;
    const { activeSquare } = this.state;
    const square = this.getEventSquare(event);
    const newState = {};
    if (square === activeSquare) {
      newState.deselect = true;
    }
    if (square.piece && square.piece.color === game.activePlayer) {
      newState.activeSquare = square;
      newState.dragPiece = square.piece;
      newState.possibleSquares = game.legalMoves
        .filter((move) => move.fromIndex === square.index)
        .map((move) => squares[move.toIndex]);
      square.piece = null;
    }
    this.setState(newState);
  };

  onMouseUp = (event) => {
    logger.trace('onMouseUp');
    const { updateApp, confirmMove } = this.props;
    const {
      game,
      activeSquare,
      dragPiece,
      deselect,
    } = this.state;
    if (!activeSquare) return;

    if (dragPiece) {
      activeSquare.piece = dragPiece;
      this.setState({ dragPiece: null });
    }

    const square = this.getEventSquare(event);
    if (square === activeSquare && deselect) {
      this.setState({
        activeSquare: null,
        possibleSquares: [],
        deselect: false,
      });
      return;
    }

    const move = this.getLegalMove(square);
    if (!move) return;

    this.doTempMove(move);
    updateApp(game);

    if (move.isPawnPromotion) {
      this.setState({ promotionMove: move });
    } else if (game.confirmationDisabled) {
      confirmMove();
    }
  };

  onMouseOut = () => {
    const { activeSquare, dragPiece } = this.state;
    if (dragPiece) {
      logger.trace('onMouseOut');
      if (activeSquare) {
        activeSquare.piece = dragPiece;
      }
      this.setState({
        activeSquare: null,
        possibleSquares: [],
        dragPiece: null,
      });
    }
  };

  onClickPawnPromotion = (event) => {
    logger.trace('onClickPawnPromotion');
    const { game, promotionMove } = this.state;
    const { updateGameOver, computerMove } = this.props;
    const index = Math.floor(event.offsetX / squareSize);
    promotionMove.pawnPromotionType = promotionTypes[index];
    this.setState({ promotionMove: null });
    game.confirmMove();
    this.syncSquares();
    updateGameOver();
    if (!game.isGameOver) {
      computerMove();
    }
  };

  getEventSquare = (event) => {
    logger.trace('getEventSquare');
    const { squares } = this.state;
    const rank = 7 - Math.floor(event.offsetY / squareSize);
    const file = Math.floor(event.offsetX / squareSize);
    return squares[rank * 8 + file];
  };

  handleEnPassant = (move, newSquares) => {
    const offset = pieceColorFromPieceId(move.piece) === white ? -8 : 8;
    const captureSquareIndex = move.toIndex + offset;
    newSquares[captureSquareIndex].piece = null;
  };

  handleCastle = (move, newSquares) => {
    const isKingSide = getFile(move.toIndex) === 6;
    const rookRank = pieceColorFromPieceId(move.piece) === white ? 0 : 7;
    const rookFile = isKingSide ? 7 : 0;
    const targetFile = isKingSide ? 5 : 3;
    const fromIndex = rookRank * 8 + rookFile;
    const toIndex = rookRank * 8 + targetFile;
    newSquares[toIndex].piece = newSquares[fromIndex].piece;
    newSquares[fromIndex].piece = null;
  };

  doTempMove = (move) => {
    logger.trace('doTempMove');
    const { game, squares } = this.state;
    game.tempMove = move;
    const newSquares = [...squares];
    newSquares[move.fromIndex].piece = null;
    newSquares[move.toIndex].piece = Piece.fromPieceId(move.piece);
    switch (move.type) {
      case MoveType.enPassant:
        this.handleEnPassant(move, newSquares);
        break;
      case MoveType.kingSideCastle:
      case MoveType.queenSideCastle:
        this.handleCastle(move, newSquares);
        break;
      default:
        break;
    }
    this.setState({
      squares: newSquares,
      activeSquare: null,
      possibleSquares: [],
      previousSquares: [
        squares[move.fromIndex],
        squares[move.toIndex],
      ],
    });
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
      game,
    } = this.state;
    const { capturedPieces, playerScore } = game;
    const width = boardSize;
    const height = boardSize;
    const flexBasis = boardSize;

    return (
      <div className="board">
        <div className="canvas-container" style={{ width, height, flexBasis }}>
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
        <CapturedPieces capturedPieces={capturedPieces} playerScore={playerScore} />
        {this.getPromotionModal()}
      </div>
    );
  }
}

export default Board;
