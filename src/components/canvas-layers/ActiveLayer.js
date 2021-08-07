import React from 'react';
import {
  squareSize,
  boardSize,
  activeOverlay,
  overlayOpacity,
} from '../../game/constants';
import { clearCanvas } from '../../utils/CanvasHelpers';
import Logger from '../../utils/Logger';

const logger = new Logger('ActiveLayer');
const canvasId = 'active-layer';

class ActiveLayer extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor', { props });
    this.state = {
      ctx: null,
      activeSquare: props.activeSquare,
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
    const { activeSquare } = this.state;
    if (activeSquare !== prevState.activeSquare) {
      this.draw();
    }
  }

  static getDerivedStateFromProps(props, state) {
    return props.activeSquare === state.activeSquare
      ? null
      : { activeSquare: props.activeSquare };
  }

  draw = () => {
    const { ctx, activeSquare } = this.state;
    clearCanvas(ctx);
    if (activeSquare) {
      ctx.fillStyle = activeOverlay;
      ctx.globalAlpha = overlayOpacity;
      ctx.fillRect(activeSquare.xPos, activeSquare.yPos, squareSize, squareSize);
      ctx.globalAlpha = 1.0;
    }
  };

  render() {
    logger.trace('render');
    return <canvas id={canvasId} />;
  }
}

export default ActiveLayer;
