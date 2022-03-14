import React, { useEffect, useState } from 'react';
import DragLayer from './DragLayer';
import { boardSize } from '../../game/utils';
import Logger from '../../Logger';

const logger = new Logger('InteractiveLayer');
const canvasId = 'interactive-layer';

const InteractiveLayer = ({
  dragPiece,
  onMouseDown,
  onMouseUp,
  onMouseOut,
}) => {
  logger.trace('render');

  const [dragX, setDragX] = useState(null);
  const [dragY, setDragY] = useState(null);

  const onMouseMove = (e) => {
    setDragX(e.offsetX);
    setDragY(e.offsetY);
  };

  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    canvas.onmousedown = onMouseDown;
    canvas.onmouseup = onMouseUp;
    canvas.onmouseout = onMouseOut;
    canvas.onmousemove = onMouseMove;
  }, []);

  const dragLayer = dragPiece
    ? (
      <DragLayer
        dragPiece={dragPiece}
        dragX={dragX}
        dragY={dragY}
      />
    ) : null;

  return (
    <>
      {dragLayer}
      <canvas id={canvasId} />
    </>
  );
};

export default InteractiveLayer;
