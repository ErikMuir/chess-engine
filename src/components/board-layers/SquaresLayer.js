import React, { useEffect } from 'react';
import { squareSize, boardSize } from '../../game/utils';
import Logger from '../../Logger';

const logger = new Logger('SquaresLayer');
const canvasId = 'squares-layer';

const SquaresLayer = ({ squares }) => {
  logger.trace('render');

  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    const ctx = canvas.getContext('2d');
    squares.forEach((sq) => {
      ctx.fillStyle = sq.squareColor;
      ctx.fillRect(sq.xPos, sq.yPos, squareSize, squareSize);
    });
  }, []);

  const style = { borderRadius: '3px' };

  return <canvas id={canvasId} style={style} />;
};

export default SquaresLayer;
