import React from 'react';
import { squareSize, boardSize } from '../../game/constants';
import Logger from '../../utils/Logger';

const logger = new Logger('BoardLayer');
const canvasId = 'board-layer';

class BoardLayer extends React.Component {
  componentDidMount() {
    logger.trace('componentDidMount');
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    const ctx = canvas.getContext('2d');
    const { squares } = this.props;
    squares.forEach((sq) => {
      ctx.fillStyle = sq.squareColor;
      ctx.fillRect(sq.xPos, sq.yPos, squareSize, squareSize);
    });
  }

  render() {
    logger.trace('render');
    return <canvas id={canvasId} />;
  }
}

export default BoardLayer;
