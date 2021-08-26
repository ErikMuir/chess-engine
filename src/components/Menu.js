import React from 'react';
import { CSSTransition } from 'react-transition-group';
import Modal from 'react-modal';
import Logger from '../Logger';
import '../styles/menu.css';

const logger = new Logger('Menu');
const loadGameInputId = 'load-game-input';

class Menu extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor');

    this.state = { isOpen: false };

    this.fileReader = new FileReader();
    this.fileReader.onerror = () => logger.error(this.fileReader.error);
    this.fileReader.onload = () => this.handleLoad(this.fileReader.result);

    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu = () => {
    logger.trace('toggleMenu');
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  chooseFile = () => {
    logger.trace('chooseFile');
    const loadGameInput = document.getElementById(loadGameInputId);
    loadGameInput.click();
  };

  readFile = () => {
    logger.trace('readFile');
    const loadGameInput = document.getElementById(loadGameInputId);
    const file = loadGameInput.files[0];
    this.fileReader.readAsText(file);
  };

  validateGameJson = (gameJson) => {
    logger.trace('validateGameJson');
    if (
      !gameJson
      || !gameJson.fen
      || !gameJson.pgn
      || !gameJson.pgn.white
      || !gameJson.pgn.black
    ) {
      throw new Error('Invalid game json');
    }
  };

  handleNew = () => {
    logger.trace('handleNew');
    const { newGame } = this.props;
    newGame();
    this.toggleMenu();
  };

  handleLoad = (readerResult) => {
    logger.trace('handleLoad');
    try {
      const gameJson = JSON.parse(readerResult);
      this.validateGameJson(gameJson);
      const { loadGame } = this.props;
      loadGame(gameJson);
      this.toggleMenu();
    } catch (err) {
      logger.error('Error loading game', err);
      // TODO : inform user
    }
  };

  handleSave = () => {
    logger.trace('handleSave');
    const { saveGame } = this.props;
    saveGame();
    this.toggleMenu();
  };

  render() {
    logger.trace('render');
    const { isOpen } = this.state;
    const modalStyles = {
      overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      },
      content: {
        color: '#595959',
        backgroundColor: 'white',
        borderRadius: 0,
        border: 0,
        padding: 0,
        height: '100vh',
        width: '25vw',
        position: 'absolute',
        top: 0,
        left: 0,
        inset: 0,
      },
    };
    return (
      <>
        <button type="button" className="icon-button" onClick={this.toggleMenu}>☰</button>
        <CSSTransition
          in={isOpen}
          timeout={300}
          classNames="dialog"
        >
          <Modal
            isOpen={isOpen}
            closeTimeoutMS={500}
            onRequestClose={this.toggleMenu}
            style={modalStyles}
          >
            <header className="menu__header">
              <div className="menu__title">Menu</div>
              <button
                type="button"
                className="menu__close"
                aria-label="Close menu"
                onClick={this.toggleMenu}
              />
            </header>
            <div className="menu__list">
              <button type="button" onClick={this.handleNew}>New</button>
              <button type="button" onClick={this.chooseFile}>Load</button>
              <button type="button" onClick={this.handleSave}>Save</button>
            </div>
            <input
              type="file"
              id={loadGameInputId}
              onChange={this.readFile}
              accept="application/json"
            />
          </Modal>
        </CSSTransition>
      </>
    );
  }
}

export default Menu;
