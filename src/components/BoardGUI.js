import React from 'react';
import Game from '../game/Game';
import Board from '../game/Board';
import CanvasContainer from './CanvasContainer';
import { squareSize } from '../game/constants';

const canvasId = 'canvas-chess-board';

class BoardGUI extends React.Component {
  constructor(props) {
    super(props);
    const game = new Game();
    const board = new Board(game);
    this.state = { board };
  }

  componentDidMount() {
    const { board } = this.state;
    const canvas = document.getElementById(canvasId);
    canvas.onmousedown = board.onMouseDown;
    canvas.onmouseup = board.onMouseUp;
    canvas.onmousemove = board.onMouseMove;
    canvas.onmouseout = board.onMouseOut;
    board.ctx = canvas.getContext('2d');
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
