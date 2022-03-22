import React, { useEffect, useState } from 'react';
import { proportion, boardSize } from '../../engine/utils';
import { clearCanvas } from '../../utils';

const canvasId = 'pieces-layer';

const PiecesLayer = ({ piecesSquares }) => {
  const [ctx, setCtx] = useState(null);

  const draw = () => {
    if (!ctx) return;
    clearCanvas(ctx);
    piecesSquares
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

  useEffect(draw, [ctx]);

  useEffect(draw, [piecesSquares]);

  return <canvas id={canvasId} />;
};

export default PiecesLayer;
