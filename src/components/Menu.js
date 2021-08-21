/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { CSSTransition } from 'react-transition-group';
import Modal from 'react-modal';
import Logger from '../Logger';
import '../styles/menu.css';

const logger = new Logger('Menu');

class Menu extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor');
    this.state = { isOpen: false };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu = () => {
    logger.trace('toggleMenu');
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  handleNew = () => {
    logger.trace('handleNew');
    const { newGame } = this.props;
    newGame();
    this.toggleMenu();
  };

  handleLoad = () => {
    logger.trace('handleLoad');
    const { loadGame } = this.props;
    loadGame();
    this.toggleMenu();
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
            <ul className="menu__list">
              <li onClick={this.handleNew}>New</li>
              <li onClick={this.handleLoad}>Load</li>
              <li onClick={this.handleSave}>Save</li>
            </ul>
          </Modal>
        </CSSTransition>
      </>
    );
  }
}

export default Menu;
