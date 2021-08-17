import React from 'react';
import { squareSize, boardSize } from '../../game/utils';
import Logger from '../../Logger';

const logger = new Logger('SquaresLayer');
const canvasId = 'squares-layer';

class SquaresLayer extends React.Component {
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
    const style = { borderRadius: '3px' };
    return <canvas id={canvasId} style={style} />;
  }
}

export default SquaresLayer;
