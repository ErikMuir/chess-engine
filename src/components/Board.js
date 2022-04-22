import React, { useState, useEffect } from 'react';
import {
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useRecoilCallback,
} from 'recoil';
import {
  ActiveLayer,
  InteractiveLayer,
  LabelsLayer,
  PiecesLayer,
  PossibleLayer,
  PreviousLayer,
  SquaresLayer,
} from './board-layers';
import CapturedPieces from './CapturedPieces';
import PawnPromotion from './PawnPromotion';
import {
  activeSquareState,
  confirmationDisabledState,
  dragPieceState,
  fenHistoryState,
  gameState,
  gameOverModalState,
  moveIndexState,
  possibleSquaresState,
  promotionModalState,
  squaresState,
  tempMoveState,
} from '../state';
import {
  Game,
  Move,
  promotionTypes,
  Piece,
  Square,
  squareSize, boardSize, getSquareIndexFromEvent,
} from '../engine';
import Logger from '../Logger';

const log = new Logger('Board');

const Board = ({
  doTempMove,
  confirmMove,
  computerMove,
  activePlayer,
}) => {
  const [deselect, setDeselect] = useState(false);

  const moveIndex = useRecoilValue(moveIndexState);
  const fenHistory = useRecoilValue(fenHistoryState);

  const setShowGameOverModal = useSetRecoilState(gameOverModalState);
  const setSquares = useSetRecoilState(squaresState);

  const [activeSquare, setActiveSquare] = useRecoilState(activeSquareState);
  const [possibleSquares, setPossibleSquares] = useRecoilState(possibleSquaresState);
  const [dragPiece, setDragPiece] = useRecoilState(dragPieceState);
  const [showPromotionModal, setShowPromotionModal] = useRecoilState(promotionModalState);
  const [tempMove, setTempMove] = useRecoilState(tempMoveState);

  const syncSquares = () => {
    log.debug('sync');
    const fen = fenHistory[moveIndex];
    const currentGame = new Game({ fen });
    const newSquares = [];
    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        const index = rank * 8 + file;
        const square = new Square(file, rank);
        const pieceId = currentGame.squares[index];
        square.piece = pieceId ? Piece.fromPieceId(pieceId) : null;
        newSquares.push(square);
      }
    }
    setSquares(newSquares);
  };

  useEffect(() => {
    if (!tempMove) syncSquares();
  }, [tempMove, moveIndex]);

  const onMouseDown = useRecoilCallback(({ snapshot }) => async (e) => {
    log.debug('mouse down');
    const currentGame = await snapshot.getPromise(gameState);
    if (tempMove || currentGame.isGameOver || currentGame.activePlayer !== currentGame.playerColor) return;
    const currentSquares = await snapshot.getPromise(squaresState);
    const square = currentSquares[getSquareIndexFromEvent(e)];
    if (activeSquare && !possibleSquares.includes(square)) {
      setDeselect(true);
    }
    if (square.piece && square.piece.color === currentGame.activePlayer) {
      setActiveSquare(square);
      setDragPiece(square.piece);
      setPossibleSquares(currentGame.legalMoves
        .filter((move) => move.fromIndex === square.index)
        .map((move) => currentSquares[move.toIndex]));
      const newSquares = [...currentSquares];
      newSquares[square.index] = new Square(square.file, square.rank);
      setSquares(newSquares);
    }
  }, []);

  const onMouseUp = useRecoilCallback(({ snapshot }) => async (e) => {
    log.debug('mouse up');
    const currentActiveSquare = await snapshot.getPromise(activeSquareState);
    if (!currentActiveSquare) return;

    const currentSquares = await snapshot.getPromise(squaresState);
    const targetSquare = currentSquares[getSquareIndexFromEvent(e)];
    const currentDragPiece = await snapshot.getPromise(dragPieceState);
    if (currentDragPiece) {
      const newSquares = currentSquares.map((sq) => {
        if (sq.index !== targetSquare.index) return sq;
        const newSquare = new Square(sq.file, sq.rank);
        newSquare.piece = currentDragPiece;
        return newSquare;
      });
      setSquares(newSquares);
      setDragPiece(null);
    }

    const currentPossibleSquares = await snapshot.getPromise(possibleSquaresState);
    if (deselect && !currentPossibleSquares.includes(targetSquare)) {
      setActiveSquare(null);
      setPossibleSquares([]);
      setDeselect(false);
      return;
    }

    const currentGame = await snapshot.getPromise(gameState);
    const move = currentGame.legalMoves
      .find((legalMove) => legalMove.fromIndex === currentActiveSquare.index
        && legalMove.toIndex === targetSquare.index);
    if (!move) return;

    doTempMove(move);

    if (move.isPawnPromotion) {
      setShowPromotionModal(true);
      return;
    }

    const currentIsConfirmationDisabled = await snapshot.getPromise(confirmationDisabledState);
    if (currentIsConfirmationDisabled) {
      confirmMove();
    }
  }, []);

  const onMouseOut = () => {
    if (dragPiece) {
      if (activeSquare) {
        activeSquare.piece = dragPiece;
      }
      setActiveSquare(null);
      setPossibleSquares([]);
      setDragPiece(null);
    }
  };

  const onClickPawnPromotion = useRecoilCallback(({ snapshot }) => async (e) => {
    const index = Math.floor(e.offsetX / squareSize);
    const currentTempMove = await snapshot.getPromise(tempMoveState);
    const newTempMove = Move.clone(currentTempMove);
    newTempMove.pawnPromotionType = promotionTypes[index];
    setTempMove(newTempMove);
    setShowPromotionModal(false);
    confirmMove();
    const currentGame = await snapshot.getPromise(gameState);
    if (currentGame.isGameOver) {
      setShowGameOverModal(true);
    } else {
      computerMove();
    }
  }, []);

  const width = boardSize;
  const height = boardSize;
  const flexBasis = boardSize;
  const promotionModal = showPromotionModal
    ? (
      <PawnPromotion
        onClick={onClickPawnPromotion}
        activePlayer={activePlayer}
      />
    ) : null;

  return (
    <div className="board">
      <div className="canvas-container" style={{ width, height, flexBasis }}>
        <SquaresLayer />
        <LabelsLayer />
        <PreviousLayer />
        <ActiveLayer />
        <PiecesLayer />
        <PossibleLayer />
        <InteractiveLayer
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseOut={onMouseOut}
        />
      </div>
      <CapturedPieces />
      {promotionModal}
    </div>
  );
};

export default Board;
