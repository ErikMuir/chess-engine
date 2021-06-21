import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './styles/app.css';
import './styles/micromodal.css';

ReactDOM.render(<App />, document.getElementById('app'));

/*
let _game;
let _board;

window.onload = () => {
  _game = new Game({ fen: Constants.startPosition });
  _board = new Board(_game);
  MicroModal.init({
    awaitOpenAnimation: true,
    awaitCloseAnimation: true,
  });
};
*/
