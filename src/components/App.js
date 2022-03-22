import React from 'react';
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
import Game from '../engine/Game';
import PGN from '../engine/PGN';
import { importGameFromJson } from '../engine/import';
import { getMove } from '../engine/moveGeneration';
import { sleep } from '../utils';
import '../styles/app.css';
import '../styles/modal.css';

Modal.setAppElement('#app');
const log = new Logger('App');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game: new Game(),
      hint: null,
      showGameOverModal: false,
      showResignationModal: false,
      confirmationDisabled: false,
      showInformationModal: false,
      forceRefresh: 0,
    };
    this.newGame = this.newGame.bind(this);
    this.importGame = this.importGame.bind(this);
    this.exportGame = this.exportGame.bind(this);
    this.resign = this.resign.bind(this);
    this.getHint = this.getHint.bind(this);
    this.showInformation = this.showInformation.bind(this);
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
    this.closeHintModal = this.closeHintModal.bind(this);
    this.closeInformationModal = this.closeInformationModal.bind(this);
    this.closeGameOverModal = this.closeGameOverModal.bind(this);
  }

  closeHintModal = () => {
    this.setState({ hint: null });
  };

  closeInformationModal = () => {
    this.setState({ showInformationModal: false });
  };

  closeGameOverModal = () => {
    this.setState({ showGameOverModal: false });
  };

  closeResignationModal = () => {
    this.setState({ showResignationModal: false });
  };

  newGame = () => {
    log.debug('new game');
    this.setState({ game: new Game() });
    this.forceRefreshHack();
  };

  importGame = (gameJson) => {
    log.debug('import game');
    const game = importGameFromJson(gameJson);
    this.setState({ game });
    this.forceRefreshHack();
  };

  exportGame = () => {
    log.debug('export game');
    const { game } = this.state;
    const fileName = `chess-${new Date().toISOString()}.json`;
    const blob = new Blob([game.json], { type: 'application/json' });
    FileSaver.saveAs(blob, fileName, { autoBom: true });
  };

  resign = () => {
    this.setState({ showResignationModal: true });
  };

  confirmResignation = () => {
    const { game } = this.state;
    this.closeResignationModal();
    game.resign();
    this.updateApp(game);
    this.updateGameOver();
  };

  getHint = () => {
    const { game } = this.state;
    const move = getMove(game);
    const hint = PGN.get(move, game.legalMoves);
    this.setState({ hint });
  };

  toggleConfirmation = () => {
    const { confirmationDisabled } = this.state;
    this.setState({ confirmationDisabled: !confirmationDisabled });
  };

  showInformation = () => {
    this.setState({ showInformationModal: true });
  };

  moveBackward = () => {
    log.debug('navigate move backward');
    const { game } = this.state;
    game.moveBackward();
    this.updateApp(game);
    this.forceRefreshHack();
  };

  moveForward = () => {
    log.debug('navigate move forward');
    const { game } = this.state;
    game.moveForward();
    this.updateApp(game);
    this.forceRefreshHack();
  };

  moveJump = (moveIndex) => {
    log.debug('navigate move jump');
    const { game } = this.state;
    game.moveJump(moveIndex);
    this.updateApp(game);
    this.forceRefreshHack();
  };

  confirmMove = () => {
    log.debug('confirm move');
    const { game } = this.state;

    game.confirmMove();
    this.updateApp(game);
    this.forceRefreshHack();
    this.updateGameOver();

    if (!game.isGameOver) {
      this.computerMove();
    }
  };

  cancelMove = () => {
    log.debug('cancel move');
    const { game } = this.state;
    game.cancelMove();
    this.updateApp(game);
    this.forceRefreshHack();
  };

  updateApp = (game) => {
    log.debug('update app game');
    this.setState({ game });
  };

  updateGameOver = () => {
    const { game } = this.state;
    this.setState({ showGameOverModal: game.isGameOver });
  };

  forceRefreshHack = () => {
    log.debug('*** force refresh hack ***');
    const { forceRefresh } = this.state;
    const newForceRefresh = forceRefresh + 1;
    this.setState({ forceRefresh: newForceRefresh });
  };

  computerMove = () => {
    log.debug('computer move');
    const { game } = this.state;
    const move = getMove(game);
    // wait 1 second to simulate the computer "thinking"
    sleep(1000).then(() => {
      game.doMove(move);
      this.updateApp(game);
      this.updateGameOver();
      this.forceRefreshHack();
    });
  };

  getInformationModal = () => {
    const { showInformationModal } = this.state;
    return showInformationModal
      ? <Information closeInformationModal={this.closeInformationModal} />
      : null;
  };

  getHintModal = () => {
    const { hint } = this.state;
    return hint
      ? <Hint hint={hint} closeHintModal={this.closeHintModal} />
      : null;
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
    log.debug('render');
    const { game, forceRefresh, confirmationDisabled } = this.state;
    return (
      <div className="app-container">
        <header className="app-header" />
        <main className="app-main">
          <GameControls
            newGame={this.newGame}
            importGame={this.importGame}
            exportGame={this.exportGame}
            resign={this.resign}
            getHint={this.getHint}
            toggleConfirmation={this.toggleConfirmation}
            confirmationDisabled={confirmationDisabled}
            showInformation={this.showInformation}
            isGameOver={game.isGameOver}
          />
          <Board
            game={game}
            forceRefresh={forceRefresh}
            updateApp={this.updateApp}
            updateGameOver={this.updateGameOver}
            confirmMove={this.confirmMove}
            computerMove={this.computerMove}
            confirmationDisabled={confirmationDisabled}
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
        {this.getInformationModal()}
        {this.getHintModal()}
        {this.getGameOverModal()}
        {this.getResignationModal()}
      </div>
    );
  }
}

export default App;
