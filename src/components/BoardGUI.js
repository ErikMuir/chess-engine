import React from 'react';
import Game from '../game/Game';
import Board from '../game/Board';
import { squareSize, startPosition } from '../game/constants';
import CanvasContainer from './CanvasContainer';

const canvasId = 'canvas-chess-board';

class BoardGUI extends React.Component {
  constructor(props) {
    super(props);
    const game = new Game({ fen: startPosition });
    const board = new Board(game);
    this.state = { board };
  }

  componentDidMount() {
    const { board } = this.state;
    const canvas = document.getElementById(canvasId);
    canvas.width = squareSize * 8;
    canvas.height = squareSize * 8;
    canvas.onmousedown = board.onMouseDown;
    canvas.onmouseup = board.onMouseUp;
    canvas.onmousemove = board.onMouseMove;
    canvas.onmouseout = board.onMouseOut;
    board.ctx = canvas.getContext('2d');

    // MicroModal.init({
    //   awaitOpenAnimation: true,
    //   awaitCloseAnimation: true,
    // });
  }

  render() {
    const { board } = this.state;
    const boardSize = squareSize * 8;
    return (
      <CanvasContainer
        canvasId={canvasId}
        draw={board.draw}
        width={boardSize}
        height={boardSize}
      />
    );
  }
}

export default BoardGUI;
