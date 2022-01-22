import React from 'react';
import Modal from 'react-modal';
import FileSaver from 'file-saver';
import Board from './Board';
import ConfirmModal from './ConfirmModal';
import Footer from './Footer';
import GameControls from './GameControls';
import GameDetails from './GameDetails';
import GameOver from './GameOver';
import Logger from '../Logger';
import Game from '../game/Game';
import { importGameFromJson } from '../game/import';
import { getMove } from '../game/moveGeneration';
import { sleep } from '../utils';
import '../styles/app.css';
import '../styles/canvas.css';
import '../styles/modal.css';

Modal.setAppElement('#app');
const logger = new Logger('App');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game: new Game(),
      showGameOverModal: false,
      showResignationModal: false,
      forceRefresh: 0,
    };
    this.newGame = this.newGame.bind(this);
    this.importGame = this.importGame.bind(this);
    this.exportGame = this.exportGame.bind(this);
    this.resign = this.resign.bind(this);
    this.confirmResignation = this.confirmResignation.bind(this);
    this.closeResignationModal = this.closeResignationModal.bind(this);
    this.toggleConfirmation = this.toggleConfirmation.bind(this);
    this.moveBackward = this.moveBackward.bind(this);
    this.moveForward = this.moveForward.bind(this);
    this.moveJump = this.moveJump.bind(this);
    this.confirmMove = this.confirmMove.bind(this);
    this.cancelMove = this.cancelMove.bind(this);
    this.updateApp = this.updateApp.bind(this);
    this.updateGameOver = this.updateGameOver.bind(this);
    this.computerMove = this.computerMove.bind(this);
    this.closeGameOverModal = this.closeGameOverModal.bind(this);
  }

  closeGameOverModal = () => {
    logger.trace('closeGameOverModal');
    this.setState({ showGameOverModal: false });
  };

  closeResignationModal = () => {
    logger.trace('closeResignationModal');
    this.setState({ showResignationModal: false });
  };

  newGame = () => {
    logger.trace('newGame');
    this.setState({ game: new Game() });
    this.forceRefresh();
  };

  importGame = (gameJson) => {
    logger.trace('importGame');
    const game = importGameFromJson(gameJson);
    this.setState({ game });
    this.forceRefresh();
  };

  exportGame = () => {
    logger.trace('exportGame');
    const { game } = this.state;
    const fileName = `chess-${new Date().toISOString()}.json`;
    const blob = new Blob([game.json], { type: 'application/json' });
    FileSaver.saveAs(blob, fileName, { autoBom: true });
  };

  resign = () => {
    logger.trace('resign');
    const { game } = this.state;
    if (!game.isGameOver) {
      this.setState({ showResignationModal: true });
    }
  };

  confirmResignation = () => {
    logger.trace('confirmResignation');
    const { game } = this.state;
    this.closeResignationModal();
    if (!game.isGameOver) {
      game.resign();
      this.updateApp(game);
      this.updateGameOver();
    }
  };

  toggleConfirmation = () => {
    logger.trace('toggleConfirmation');
    const { game } = this.state;
    game.confirmationDisabled = !game.confirmationDisabled;
    this.updateApp(game);
  };

  moveBackward = () => {
    logger.trace('moveBackward');
    const { game } = this.state;
    game.moveBackward();
    this.updateApp(game);
    this.forceRefresh();
  };

  moveForward = () => {
    logger.trace('moveForward');
    const { game } = this.state;
    game.moveForward();
    this.updateApp(game);
    this.forceRefresh();
  };

  moveJump = (moveIndex) => {
    logger.trace('moveJump');
    const { game } = this.state;
    game.moveJump(moveIndex);
    this.updateApp(game);
    this.forceRefresh();
  };

  confirmMove = () => {
    logger.trace('confirmMove');
    const { game } = this.state;

    game.confirmMove();
    this.updateApp(game);
    this.updateGameOver();

    if (!game.isGameOver) {
      this.computerMove();
    }
  };

  cancelMove = () => {
    logger.trace('cancelMove');
    const { game } = this.state;
    game.cancelMove();
    this.updateApp(game);
    this.forceRefresh();
  };

  updateApp = (game) => {
    logger.trace('updateApp');
    this.setState({ game });
  };

  updateGameOver = () => {
    logger.trace('updateGameOver');
    const { game } = this.state;
    this.setState({ showGameOverModal: game.isGameOver });
  };

  forceRefresh = () => {
    // this is a hack
    logger.trace('forceRefresh');
    const { forceRefresh } = this.state;
    const newForceRefresh = forceRefresh + 1;
    this.setState({ forceRefresh: newForceRefresh });
  };

  computerMove = () => {
    logger.trace('computerMove');
    const { game } = this.state;
    const move = getMove(game);
    // wait 1 second to simulate the computer "thinking"
    sleep(1000).then(() => {
      game.doMove(move);
      this.updateApp(game);
      this.updateGameOver();
      this.forceRefresh();
    });
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

  getResignationModal = () => {
    const { showResignationModal } = this.state;
    return showResignationModal
      ? (
        <ConfirmModal
          displayText="Are you sure you want to resign?"
          confirm={this.confirmResignation}
          cancel={this.closeResignationModal}
        />
      ) : null;
  };

  render() {
    logger.trace('render');
    const { game, forceRefresh } = this.state;
    return (
      <div className="app-container">
        <header className="app-header" />
        <main className="app-main">
          <GameControls
            newGame={this.newGame}
            importGame={this.importGame}
            exportGame={this.exportGame}
            resign={this.resign}
            toggleConfirmation={this.toggleConfirmation}
            confirmationDisabled={game.confirmationDisabled}
          />
          <Board
            game={game}
            forceRefresh={forceRefresh}
            updateApp={this.updateApp}
            updateGameOver={this.updateGameOver}
            confirmMove={this.confirmMove}
            computerMove={this.computerMove}
          />
          <GameDetails
            game={game}
            moveBackward={this.moveBackward}
            moveForward={this.moveForward}
            moveJump={this.moveJump}
            confirmMove={this.confirmMove}
            cancelMove={this.cancelMove}
          />
        </main>
        <Footer />
        {this.getGameOverModal()}
        {this.getResignationModal()}
      </div>
    );
  }
}

export default App;
