import React, { useState, useEffect } from 'react';
import {
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useRecoilCallback,
} from 'recoil';
import CapturedPieces from './CapturedPieces';
import ActiveLayer from './board-layers/ActiveLayer';
import InteractiveLayer from './board-layers/InteractiveLayer';
import LabelsLayer from './board-layers/LabelsLayer';
import PiecesLayer from './board-layers/PiecesLayer';
import PossibleLayer from './board-layers/PossibleLayer';
import PreviousLayer from './board-layers/PreviousLayer';
import SquaresLayer from './board-layers/SquaresLayer';
import PawnPromotion from './PawnPromotion';
import activeSquareState from '../state/atoms/activeSquareState';
import confirmationDisabledState from '../state/atoms/confirmationDisabledState';
import dragPieceState from '../state/atoms/dragPieceState';
import gameOverModalState from '../state/atoms/gameOverModalState';
import gameState from '../state/atoms/gameState';
import moveIndexState from '../state/atoms/moveIndexState';
import possibleSquaresState from '../state/atoms/possibleSquaresState';
import promotionModalState from '../state/atoms/promotionModalState';
import squaresState from '../state/atoms/squaresState';
import tempMoveState from '../state/atoms/tempMoveState';
import fenHistoryState from '../state/selectors/fenHistoryState';
import Game from '../engine/Game';
import Move from '../engine/Move';
import { promotionTypes } from '../engine/PieceTypes';
import Piece from '../engine/Piece';
import Square from '../engine/Square';
import { squareSize, boardSize, getSquareIndexFromEvent } from '../engine/utils';
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
