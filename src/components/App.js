import React from 'react';
import Modal from 'react-modal';
import Header from './Header';
import Main from './Main';
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
    this.updateGame = this.updateGame.bind(this);
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

  updateGame = (game) => {
    logger.trace('updateGame');
    this.setState({ game });
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
        <Main
          game={game}
          updateGame={this.updateGame}
        />
        <Footer />
      </div>
    );
  }
}

export default App;
