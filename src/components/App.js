import React from 'react';
import Modal from 'react-modal';
import FileSaver from 'file-saver';
import GameControls from './GameControls';
import Board from './Board';
import MoveControls from './MoveControls';
import GameOver from './GameOver';
import Logger from '../Logger';
import Game from '../game/Game';
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
    };
    this.newGame = this.newGame.bind(this);
    this.importGame = this.importGame.bind(this);
    this.exportGame = this.exportGame.bind(this);
    this.resign = this.resign.bind(this);
    this.updateApp = this.updateApp.bind(this);
    this.closeGameOverModal = this.closeGameOverModal.bind(this);
  }

  closeGameOverModal = () => {
    logger.trace('closeGameOverModal');
    this.setState({ showGameOverModal: false });
  };

  newGame = () => {
    logger.trace('newGame');
    this.setState({ game: new Game() });
  };

  importGame = (gameJson) => {
    logger.trace('importGame');
    const game = new Game(gameJson);
    this.setState({ game });
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
      game.resign();
      this.updateApp(game);
    }
  };

  updateApp = (game) => {
    logger.trace('updateApp');
    this.setState({ game, showGameOverModal: game.isGameOver });
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
    logger.trace('render');
    const { game } = this.state;
    return (
      <div className="app-container">
        <header className="app-header" />
        <main className="app-main">
          <GameControls
            newGame={this.newGame}
            importGame={this.importGame}
            exportGame={this.exportGame}
            resign={this.resign}
          />
          <Board game={game} updateApp={this.updateApp} />
          <MoveControls game={game} updateApp={this.updateApp} />
        </main>
        <footer className="app-footer">
          <span>{`© ${new Date().getFullYear()} MuirDev`}</span>
        </footer>
        {this.getGameOverModal()}
      </div>
    );
  }
}

export default App;
