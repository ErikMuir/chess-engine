import React, { useEffect, useState } from 'react';
import { boardSize, possibleOverlay, proportion } from '../../game/utils';
import { clearCanvas } from '../../utils';
import Logger from '../../Logger';

const logger = new Logger('PossibleLayer');
const canvasId = 'possible-layer';

const PossibleLayer = ({ possibleSquares }) => {
  logger.trace('render');

  const [ctx, setCtx] = useState(null);

  const draw = () => {
    if (!ctx) return;
    clearCanvas(ctx);
    possibleSquares
      .forEach((sq) => {
        const offset = proportion(0.5);
        const radius = sq.piece ? proportion(0.46) : proportion(0.17);
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(sq.xPos + offset, sq.yPos + offset, radius, 0, 2 * Math.PI, false);
        if (sq.piece) {
          ctx.lineWidth = 7;
          ctx.strokeStyle = possibleOverlay;
          ctx.stroke();
        } else {
          ctx.fillStyle = possibleOverlay;
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      });
    possibleSquares
      .filter((sq) => sq.piece)
      .forEach((sq) => {
        const offset = proportion(0.1);
        const size = proportion(0.8);
        const x = sq.xPos + offset;
        const y = sq.yPos + offset;
        sq.piece.getImage()
          .then((img) => ctx.drawImage(img, x, y, size, size));
      });
  };

  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    setCtx(canvas.getContext('2d'));
  }, []);

  useEffect(draw, [possibleSquares]);

  return <canvas id={canvasId} />;
};

export default PossibleLayer;
