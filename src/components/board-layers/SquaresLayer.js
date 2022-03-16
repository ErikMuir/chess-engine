import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import squaresState from '../../state/atoms/squaresState';
import { squareSize, boardSize } from '../../engine/utils';

const canvasId = 'squares-layer';

const SquaresLayer = () => {
  const [ctx, setCtx] = useState(null);
  const squares = useRecoilValue(squaresState);

  const draw = () => {
    if (!ctx) return;
    squares.forEach((sq) => {
      ctx.fillStyle = sq.squareColor;
      ctx.fillRect(sq.xPos, sq.yPos, squareSize, squareSize);
    });
  };

  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    setCtx(canvas.getContext('2d'));
    draw();
  }, []);

  useEffect(draw, [squares]);

  const style = { borderRadius: '3px' };

  return <canvas id={canvasId} style={style} />;
};

export default SquaresLayer;
