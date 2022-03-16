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
import confirmationDisabledState from '../state/atoms/confirmationDisabledState';
import gameState from '../state/atoms/gameState';
import gameOverModalState from '../state/atoms/gameOverModalState';
import hintState from '../state/atoms/hintState';
import informationModalState from '../state/atoms/informationModalState';
import previousSquaresState from '../state/atoms/previousSquaresState';
import resignationModalState from '../state/atoms/resignationModalState';
import squaresState from '../state/atoms/squaresState';
import tempMoveState from '../state/atoms/tempMoveState';
import currentMoveIndexState from '../state/selectors/currentMoveIndexState';
import gameOverState from '../state/selectors/gameOverState';
import Game from '../engine/Game';
import PGN from '../engine/PGN';
import { importGameFromJson } from '../engine/import';
import { getMove } from '../engine/moveGeneration';
import { sleep } from '../utils';
import '../styles/app.css';
import '../styles/modal.css';

Modal.setAppElement('#app');
const log = new Logger('App');

const App = () => {
  const [game, setGame] = useRecoilState(gameState);
  const [hint, setHint] = useRecoilState(hintState);
  const [showGameOverModal, setShowGameOverModal] = useRecoilState(gameOverModalState);
  const [showResignationModal, setShowResignationModal] = useRecoilState(resignationModalState);
  const [showInformationModal, setShowInformationModal] = useRecoilState(informationModalState);
  const [confirmationDisabled, setConfirmationDisabled] = useRecoilState(confirmationDisabledState);
  const [tempMove, setTempMove] = useRecoilState(tempMoveState);
  const isGameOver = useRecoilValue(gameOverState);
  const setPreviousSquares = useSetRecoilState(previousSquaresState);
  const currentMoveIndex = useRecoilValue(currentMoveIndexState);

  useEffect(() => {
    if (isGameOver) {
      setShowGameOverModal(true);
    }
  }, [game]);

  const cloneGame = (gameToClone) => new Game(gameToClone || game);

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
    setGame(new Game());
  };

  const importGame = (gameJson) => {
    const importedGame = importGameFromJson(gameJson);
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

  const moveBackward = () => {
    const updatedGame = game.moveBackward();
    setGame(updatedGame);
  };

  const moveForward = () => {
    const updatedGame = game.moveForward();
    setGame(updatedGame);
  };

  const moveJump = (moveIndex) => {
    const updatedGame = game.moveJump(moveIndex);
    setGame(updatedGame);
  };

  const computerMove = (currentGame) => {
    // wait 1 second to simulate the computer "thinking"
    sleep(1000).then(() => {
      log.debug('computer move');
      const move = getMove(currentGame);
      const updatedGame = cloneGame(currentGame).doMove(move);
      setGame(updatedGame);
    });
  };

  const confirmMove = () => {
    const updatedGame = cloneGame().doMove(tempMove);
    setGame(updatedGame);
    setTempMove(null);

    if (!isGameOver) {
      computerMove(updatedGame);
    }
  };

  const cancelMove = useRecoilCallback(({ snapshot }) => async () => {
    setTempMove(null);
    const currentSquares = await snapshot.getPromise(squaresState);
    const move = game.moveHistory[currentMoveIndex];
    const previousSquares = move
      ? [
        currentSquares[move.fromIndex],
        currentSquares[move.toIndex],
      ] : [];
    setPreviousSquares(previousSquares);
  }, []);

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
          confirmMove={confirmMove}
          computerMove={computerMove}
          activePlayer={game.activePlayer}
        />
        <GameDetails
          moveBackward={moveBackward}
          moveForward={moveForward}
          moveJump={moveJump}
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
