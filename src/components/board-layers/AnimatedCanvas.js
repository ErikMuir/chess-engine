import React, { useRef, useEffect } from 'react';
import { clearCanvas } from '../../utils';

const predraw = (context) => {
  context.save();
  clearCanvas(context);
};

const postdraw = (context) => {
  context.restore();
};

const useCanvas = (draw) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    let animationFrameId;

    const render = () => {
      frameCount += 1;
      predraw(context);
      draw(context, frameCount);
      postdraw(context);
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return canvasRef;
};

const AnimatedCanvas = (props) => {
  const { draw, canvasId, ...rest } = props;
  const canvasRef = useCanvas(draw);
  return <canvas id={canvasId} ref={canvasRef} {...rest} />;
};

export default AnimatedCanvas;
