import { useRef, useEffect } from 'react';

const clearCanvas = (context) => {
  const { width, height } = context.canvas;
  context.clearRect(0, 0, width, height);
};

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

export {
  clearCanvas,
  useCanvas,
};
