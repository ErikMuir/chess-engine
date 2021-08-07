import React from 'react';
import {
  squareSize,
  boardSize,
  previousOverlay,
  overlayOpacity,
} from '../../game/constants';
import { clearCanvas } from '../../utils/CanvasHelpers';
import Logger from '../../utils/Logger';

const logger = new Logger('PreviousLayer');
const canvasId = 'previous-layer';

class PreviousLayer extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor', { props });
    this.state = {
      ctx: null,
      previousSquares: props.previousSquares,
    };
  }

  componentDidMount() {
    logger.trace('componentDidMount');
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    const ctx = canvas.getContext('2d');
    this.setState({ ctx });
  }

  componentDidUpdate(prevProps, prevState) {
    const { previousSquares } = this.state;
    if (previousSquares !== prevState.previousSquares) {
      this.draw();
    }
  }

  static getDerivedStateFromProps(props, state) {
    return props.previousSquares === state.previousSquares
      ? null
      : { previousSquares: props.previousSquares };
  }

  draw = () => {
    const { ctx, previousSquares } = this.state;
    clearCanvas(ctx);
    previousSquares.forEach((sq) => {
      ctx.fillStyle = previousOverlay;
      ctx.globalAlpha = overlayOpacity;
      ctx.fillRect(sq.xPos, sq.yPos, squareSize, squareSize);
      ctx.globalAlpha = 1.0;
    });
  };

  render() {
    logger.trace('render');
    return <canvas id={canvasId} />;
  }
}

export default PreviousLayer;
