import React from 'react';
import { useCanvas } from '../utils/CanvasHelpers';

const Canvas = (props) => {
  const { draw, canvasId, ...rest } = props;
  const canvasRef = useCanvas(draw);
  return <canvas id={canvasId} ref={canvasRef} {...rest} />;
};

export default Canvas;
