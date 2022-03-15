import React, { useEffect, useState } from 'react';
import AnimatedCanvas from './AnimatedCanvas';
import { boardSize, proportion } from '../../game/utils';
import { clearCanvas } from '../../utils';

const canvasId = 'drag-layer';

const DragLayer = ({ dragPiece, dragX, dragY }) => {
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    setCtx(canvas.getContext('2d'));
  }, []);

  const draw = () => {
    if (!ctx) return;
    clearCanvas(ctx);
    const size = proportion(0.8);
    const x = dragX - (size / 2);
    const y = dragY - (size / 2);
    dragPiece.getImage()
      .then((img) => ctx.drawImage(img, x, y, size, size));
  };

  return <AnimatedCanvas draw={draw} canvasId={canvasId} />;
};

export default DragLayer;
