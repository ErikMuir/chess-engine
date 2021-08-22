import React from 'react';
import Modal from 'react-modal';
import Header from './Header';
import Board from './Board';
import Footer from './Footer';
import Logger from '../Logger';
import Game from '../game/Game';
import { startPosition } from '../game/utils';

Modal.setAppElement('#app');
const logger = new Logger('App');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game: new Game({ fen: startPosition }),
    };
    this.newGame = this.newGame.bind(this);
    this.loadGame = this.loadGame.bind(this);
    this.saveGame = this.saveGame.bind(this);
  }

  newGame = () => {
    logger.trace('newGame');
    this.setState({ game: new Game({ fen: startPosition }) });
  };

  loadGame = () => {
    logger.trace('loadGame - NOT IMPLEMENTED!');
  };

  saveGame = () => {
    logger.trace('saveGame - NOT IMPLEMENTED!');
  };

  render() {
    logger.trace('render');
    const { game } = this.state;
    return (
      <div className="app-container">
        <Header
          newGame={this.newGame}
          loadGame={this.loadGame}
          saveGame={this.saveGame}
        />
        <Board game={game} />
        <Footer />
      </div>
    );
  }
}

export default App;
