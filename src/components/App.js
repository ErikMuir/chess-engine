/* eslint-disable no-use-before-define */
import React, { useEffect } from 'react';
import {
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useRecoilCallback,
} from 'recoil';
import Modal from 'react-modal';
import FileSaver from 'file-saver';
import Board from './Board';
import ConfirmModal from './ConfirmModal';
import Footer from './Footer';
import GameControls from './GameControls';
import GameDetails from './GameDetails';
import Information from './Information';
import Hint from './Hint';
import GameOver from './GameOver';
import Logger from '../Logger';
import activeSquareState from '../state/atoms/activeSquareState';
import computerMoveState from '../state/atoms/computerMoveState';
import confirmationDisabledState from '../state/atoms/confirmationDisabledState';
import gameState from '../state/atoms/gameState';
import gameOverModalState from '../state/atoms/gameOverModalState';
import hintState from '../state/atoms/hintState';
import informationModalState from '../state/atoms/informationModalState';
import moveIndexState from '../state/atoms/moveIndexState';
import possibleSquaresState from '../state/atoms/possibleSquaresState';
import previousSquaresState from '../state/atoms/previousSquaresState';
import resignationModalState from '../state/atoms/resignationModalState';
import squaresState from '../state/atoms/squaresState';
import tempMoveState from '../state/atoms/tempMoveState';
import gameOverState from '../state/selectors/gameOverState';
import Game from '../engine/Game';
import MoveType from '../engine/MoveType';
import Piece from '../engine/Piece';
import Square from '../engine/Square';
import { white, pieceColorFromPieceId } from '../engine/PieceColors';
import PGN from '../engine/PGN';
import { importGameFromJson } from '../engine/import';
import { getFile } from '../engine/utils';
import { getMove } from '../engine/moveGeneration';
import { sleep } from '../utils';
import '../styles/app.css';
import '../styles/modal.css';

Modal.setAppElement('#app');
const log = new Logger('App');

const App = () => {
  const isGameOver = useRecoilValue(gameOverState);

  const setPreviousSquares = useSetRecoilState(previousSquaresState);
  const setSquares = useSetRecoilState(squaresState);
  const setActiveSquare = useSetRecoilState(activeSquareState);
  const setPossibleSquares = useSetRecoilState(possibleSquaresState);
  const setTempMove = useSetRecoilState(tempMoveState);

  const [game, setGame] = useRecoilState(gameState);
  const [hint, setHint] = useRecoilState(hintState);
  const [showGameOverModal, setShowGameOverModal] = useRecoilState(gameOverModalState);
  const [showResignationModal, setShowResignationModal] = useRecoilState(resignationModalState);
  const [showInformationModal, setShowInformationModal] = useRecoilState(informationModalState);
  const [confirmationDisabled, setConfirmationDisabled] = useRecoilState(confirmationDisabledState);
  const [isComputerMove, setComputerMove] = useRecoilState(computerMoveState);
  const [moveIndex, setMoveIndex] = useRecoilState(moveIndexState);

  useEffect(() => updatePreviousSquares(), [moveIndex]);

  useEffect(() => isGameOver && setShowGameOverModal(true), [game]);

  useEffect(() => {
    if (isComputerMove && !isGameOver) {
      // wait 1 second to simulate the computer "thinking"
      log.debug('computer thinking...');
      sleep(1000).then(computerMove);
    }
  }, [isComputerMove]);

  const reset = () => {
    setPreviousSquares([]);
    setActiveSquare(null);
    setPossibleSquares([]);
    setShowGameOverModal(false);
    setShowResignationModal(false);
    setShowInformationModal(false);
    setTempMove(null);
    setComputerMove(false);
    setMoveIndex(0);
  };

  const closeHintModal = () => {
    setHint(null);
  };

  const closeInformationModal = () => {
    setShowInformationModal(false);
  };

  const closeGameOverModal = () => {
    setShowGameOverModal(false);
  };

  const closeResignationModal = () => {
    setShowResignationModal(false);
  };

  const newGame = () => {
    reset();
    setGame(new Game());
  };

  const importGame = (gameJson) => {
    const importedGame = importGameFromJson(gameJson);
    reset();
    setGame(importedGame);
  };

  const exportGame = () => {
    const fileName = `chess-${new Date().toISOString()}.json`;
    const blob = new Blob([game.json], { type: 'application/json' });
    FileSaver.saveAs(blob, fileName, { autoBom: true });
  };

  const resign = () => {
    setShowResignationModal(true);
  };

  const confirmResignation = () => {
    closeResignationModal();
    const updatedGame = game.resign();
    setGame(updatedGame);
  };

  const getHint = () => {
    const move = getMove(game);
    setHint(PGN.get(move, game.legalMoves));
  };

  const toggleConfirmation = () => {
    setConfirmationDisabled(!confirmationDisabled);
  };

  const showInformation = () => {
    setShowInformationModal(true);
  };

  const updatePreviousSquares = useRecoilCallback(({ snapshot }) => async (move) => {
    const previousSquares = [];
    if (!move) {
      const { moveHistory } = await snapshot.getPromise(gameState);
      const currentMoveIndex = await snapshot.getPromise(moveIndexState);
      move = moveHistory[currentMoveIndex - 1];
    }
    if (move) {
      const currentSquares = await snapshot.getPromise(squaresState);
      previousSquares.push(currentSquares[move.fromIndex]);
      previousSquares.push(currentSquares[move.toIndex]);
    }
    setPreviousSquares(previousSquares);
  }, []);

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
    updatePreviousSquares(move);
  }, []);

  const computerMove = useRecoilCallback(({ snapshot }) => async () => {
    log.debug('computer move');
    const currentGame = await snapshot.getPromise(gameState);
    const currentMoveIndex = await snapshot.getPromise(moveIndexState);
    const move = getMove(currentGame);
    const updatedGame = Game.clone({ ...currentGame, moveIndex: currentMoveIndex }).doMove(move);
    setGame(updatedGame);
    setMoveIndex(currentMoveIndex + 1);
    setComputerMove(false);
  }, []);

  const confirmMove = useRecoilCallback(({ snapshot }) => async () => {
    const currentGame = await snapshot.getPromise(gameState);
    const currentMoveIndex = await snapshot.getPromise(moveIndexState);
    const currentTempMove = await snapshot.getPromise(tempMoveState);
    const updatedGame = Game.clone({ ...currentGame, moveIndex: currentMoveIndex }).doMove(currentTempMove);
    setGame(updatedGame);
    setMoveIndex(currentMoveIndex + 1);
    setTempMove(null);

    const currentIsGameOver = await snapshot.getPromise(gameOverState);
    if (!currentIsGameOver) {
      setComputerMove(true);
    }
  }, []);

  const cancelMove = () => {
    setTempMove(null);
    updatePreviousSquares();
  };

  const informationModal = showInformationModal
    ? <Information closeInformationModal={closeInformationModal} />
    : null;

  const hintModal = hint
    ? <Hint closeHintModal={closeHintModal} />
    : null;

  const gameOverModal = showGameOverModal
    ? <GameOver closeGameOverModal={closeGameOverModal} />
    : null;

  const resignationModal = showResignationModal
    ? (
      <ConfirmModal
        displayText="Are you sure you want to resign?"
        confirm={confirmResignation}
        cancel={closeResignationModal}
      />
    ) : null;

  return (
    <div className="app-container">
      <header className="app-header" />
      <main className="app-main">
        <GameControls
          newGame={newGame}
          importGame={importGame}
          exportGame={exportGame}
          resign={resign}
          getHint={getHint}
          toggleConfirmation={toggleConfirmation}
          showInformation={showInformation}
        />
        <Board
          doTempMove={doTempMove}
          confirmMove={confirmMove}
          computerMove={computerMove}
          activePlayer={game.activePlayer}
        />
        <GameDetails
          confirmMove={confirmMove}
          cancelMove={cancelMove}
        />
      </main>
      <Footer />
      {informationModal}
      {hintModal}
      {gameOverModal}
      {resignationModal}
    </div>
  );
};

export default App;
