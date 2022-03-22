import React, { useEffect, useState } from 'react';
import {
  squareSize,
  boardSize,
  activeOverlay,
  overlayOpacity,
} from '../../engine/utils';
import { clearCanvas } from '../../utils';

const canvasId = 'active-layer';

const ActiveLayer = ({ activeSquare }) => {
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
