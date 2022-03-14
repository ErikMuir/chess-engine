import React, { useEffect, useState } from 'react';
import {
  squareSize,
  boardSize,
  activeOverlay,
  overlayOpacity,
} from '../../game/utils';
import { clearCanvas } from '../../utils';
import Logger from '../../Logger';

const logger = new Logger('ActiveLayer');
const canvasId = 'active-layer';

const ActiveLayer = ({ activeSquare }) => {
  logger.trace('render');

  const [ctx, setCtx] = useState(null);

  const draw = () => {
    if (!ctx) return;
    clearCanvas(ctx);
    if (activeSquare) {
      ctx.fillStyle = activeOverlay;
      ctx.globalAlpha = overlayOpacity;
      ctx.fillRect(activeSquare.xPos, activeSquare.yPos, squareSize, squareSize);
      ctx.globalAlpha = 1.0;
    }
  };

  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    setCtx(canvas.getContext('2d'));
  }, []);

  useEffect(draw, [activeSquare]);

  return <canvas id={canvasId} />;
};

export default ActiveLayer;
