import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import DragLayer from './DragLayer';
import { dragPieceState } from '../../state';
import { boardSize } from '../../engine';

const canvasId = 'interactive-layer';

const InteractiveLayer = ({
  onMouseDown,
  onMouseUp,
  onMouseOut,
}) => {
  const [dragX, setDragX] = useState(null);
  const [dragY, setDragY] = useState(null);
  const dragPiece = useRecoilValue(dragPieceState);

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
    ? <DragLayer dragPiece={dragPiece} dragX={dragX} dragY={dragY} />
    : null;

  return (
    <>
      {dragLayer}
      <canvas id={canvasId} />
    </>
  );
};

export default InteractiveLayer;
