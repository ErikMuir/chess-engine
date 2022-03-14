import React, { useEffect } from 'react';
import { boardSize, proportion, squareSize } from '../../game/utils';
import Logger from '../../Logger';

const logger = new Logger('LabelsLayer');
const canvasId = 'labels-layer';

const drawRank = (sq, ctx) => {
  const rankText = `${sq.rank + 1}`;
  const x = sq.xPos + proportion(0.05);
  const y = sq.yPos + proportion(0.2);
  ctx.fillStyle = sq.textColor;
  ctx.font = `400 ${proportion(0.175)}px sans-serif`;
  ctx.fillText(rankText, x, y);
};

const drawFile = (sq, ctx) => {
  const fileText = 'abcdefgh'[sq.file];
  const x = sq.xPos + squareSize - proportion(0.15);
  const y = sq.yPos + squareSize - proportion(0.075);
  ctx.fillStyle = sq.textColor;
  ctx.font = `400 ${proportion(0.175)}px sans-serif`;
  ctx.fillText(fileText, x, y);
};

const LabelsLayer = ({ squares }) => {
  logger.trace('render');

  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    const ctx = canvas.getContext('2d');
    squares.forEach((sq) => {
      if (sq.file === 0) drawRank(sq, ctx);
      if (sq.rank === 0) drawFile(sq, ctx);
    });
  }, []);

  return <canvas id={canvasId} />;
};

export default LabelsLayer;
