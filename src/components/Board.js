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
import possibleSquaresState from '../state/atoms/possibleSquaresState';
import previousSquaresState from '../state/atoms/previousSquaresState';
import promotionMoveState from '../state/atoms/promotionMoveState';
import squaresState from '../state/atoms/squaresState';
import tempMoveState from '../state/atoms/tempMoveState';
import currentMoveIndexState from '../state/selectors/currentMoveIndexState';
import Game from '../engine/Game';
import MoveType from '../engine/MoveType';
import { white, pieceColorFromPieceId } from '../engine/PieceColors';
import { promotionTypes } from '../engine/PieceTypes';
import Piece from '../engine/Piece';
import Square from '../engine/Square';
import {
  squareSize,
  boardSize,
  getFile,
  getSquareIndexFromEvent,
} from '../engine/utils';
import Logger from '../Logger';

const log = new Logger('Board');

const Board = ({ confirmMove, computerMove, activePlayer }) => {
  const [deselect, setDeselect] = useState(false);

  const game = useRecoilValue(gameState);
  const currentMoveIndex = useRecoilValue(currentMoveIndexState);

  const setShowGameOverModal = useSetRecoilState(gameOverModalState);
  const setPreviousSquares = useSetRecoilState(previousSquaresState);
  const setSquares = useSetRecoilState(squaresState);

  const [activeSquare, setActiveSquare] = useRecoilState(activeSquareState);
  const [possibleSquares, setPossibleSquares] = useRecoilState(possibleSquaresState);
  const [dragPiece, setDragPiece] = useRecoilState(dragPieceState);
  const [promotionMove, setPromotionMove] = useRecoilState(promotionMoveState);
  const [tempMove, setTempMove] = useRecoilState(tempMoveState);

  const syncSquares = () => {
    log.debug('sync');
    const { fenHistory } = game;
    const currentGame = new Game({ fen: fenHistory[currentMoveIndex] });
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
  }, [tempMove, currentMoveIndex]);

  const doTempMove = useRecoilCallback(({ snapshot }) => async (move) => {
    log.debug('temp move');
    setTempMove(move);
    const currentSquares = await snapshot.getPromise(squaresState);
    let newSquares = currentSquares
      .map((sq) => {
        switch (sq.index) {
          case move.fromIndex:
            return new Square(sq.file, sq.rank);
          case move.toIndex: {
            const square = new Square(sq.file, sq.rank);
            square.piece = Piece.fromPieceId(move.piece);
            return square;
          }
          default:
            return sq;
        }
      });
    switch (move.type) {
      case MoveType.enPassant: {
        const offset = pieceColorFromPieceId(move.piece) === white ? -8 : 8;
        const captureSquareIndex = move.toIndex + offset;
        newSquares = newSquares
          .map((sq) => (sq.index === captureSquareIndex ? new Square(sq.file, sq.rank) : sq));
      }
        break;
      case MoveType.kingSideCastle:
      case MoveType.queenSideCastle: {
        const isKingSide = getFile(move.toIndex) === 6;
        const rookRank = pieceColorFromPieceId(move.piece) === white ? 0 : 7;
        const rookFile = isKingSide ? 7 : 0;
        const targetFile = isKingSide ? 5 : 3;
        const fromIndex = rookRank * 8 + rookFile;
        const toIndex = rookRank * 8 + targetFile;
        const { piece } = newSquares[fromIndex];
        newSquares = newSquares
          .map((sq) => {
            switch (sq.index) {
              case toIndex: {
                const square = new Square(sq.file, sq.rank);
                square.piece = piece;
                return square;
              }
              case fromIndex:
                return new Square(sq.file, sq.rank);
              default:
                return sq;
            }
          });
      }
        break;
      default:
        break;
    }
    setSquares(newSquares);
    setActiveSquare(null);
    setPossibleSquares([]);
    setPreviousSquares([
      currentSquares[move.fromIndex],
      currentSquares[move.toIndex],
    ]);
  }, []);

  const onMouseDown = useRecoilCallback(({ snapshot }) => async (e) => {
    log.debug('mouse down');
    if (tempMove || game.isGameOver || game.activePlayer !== game.playerColor) return;
    const currentSquares = await snapshot.getPromise(squaresState);
    const square = currentSquares[getSquareIndexFromEvent(e)];
    if (activeSquare && !possibleSquares.includes(square)) {
      setDeselect(true);
    }
    if (square.piece && square.piece.color === game.activePlayer) {
      setActiveSquare(square);
      setDragPiece(square.piece);
      setPossibleSquares(game.legalMoves
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
    const currentDragPiece = await snapshot.getPromise(dragPieceState);
    if (currentDragPiece) {
      const newSquares = currentSquares.map((sq) => {
        if (sq.index !== currentActiveSquare.index) return sq;
        const newSquare = new Square(sq.file, sq.rank);
        newSquare.piece = currentDragPiece;
        return newSquare;
      });
      setSquares(newSquares);
      setDragPiece(null);
    }

    const currentPossibleSquares = await snapshot.getPromise(possibleSquaresState);
    const square = currentSquares[getSquareIndexFromEvent(e)];
    if (deselect && !currentPossibleSquares.includes(square)) {
      setActiveSquare(null);
      setPossibleSquares([]);
      setDeselect(false);
      return;
    }

    const move = game.legalMoves
      .find((legalMove) => legalMove.fromIndex === currentActiveSquare.index
        && legalMove.toIndex === square.index);
    if (!move) return;

    doTempMove(move);

    if (move.isPawnPromotion) {
      setPromotionMove(move);
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

  const onClickPawnPromotion = (e) => {
    const index = Math.floor(e.offsetX / squareSize);
    promotionMove.pawnPromotionType = promotionTypes[index];
    setPromotionMove(null);
    confirmMove(tempMove);
    setTempMove(null);
    if (game.isGameOver) {
      setShowGameOverModal(true);
    } else {
      computerMove();
    }
  };

  const width = boardSize;
  const height = boardSize;
  const flexBasis = boardSize;
  const promotionModal = promotionMove
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
