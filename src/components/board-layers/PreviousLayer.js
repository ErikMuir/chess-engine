import React, { useEffect, useState } from 'react';
import {
  squareSize,
  boardSize,
  previousOverlay,
  overlayOpacity,
} from '../../engine/utils';
import { clearCanvas } from '../../utils';

const canvasId = 'previous-layer';

const PreviousLayer = ({ previousSquares }) => {
  const [ctx, setCtx] = useState(null);

  const draw = () => {
    if (!ctx) return;
    clearCanvas(ctx);
    previousSquares.forEach((sq) => {
      ctx.fillStyle = previousOverlay;
      ctx.globalAlpha = overlayOpacity;
      ctx.fillRect(sq.xPos, sq.yPos, squareSize, squareSize);
      ctx.globalAlpha = 1.0;
    });
  };

  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    setCtx(canvas.getContext('2d'));
  }, []);

  useEffect(draw, [previousSquares]);

  return <canvas id={canvasId} />;
};

export default PreviousLayer;
