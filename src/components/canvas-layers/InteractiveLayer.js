import React from 'react';
import { boardSize } from '../../game/constants';
import Logger from '../../utils/Logger';

const logger = new Logger('InteractiveLayer');
const canvasId = 'interactive-layer';

class InteractiveLayer extends React.Component {
  componentDidMount() {
    logger.trace('componentDidMount');
    const {
      onMouseDown,
      onMouseUp,
      onMouseMove,
      onMouseOut,
    } = this.props;
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    canvas.onmousedown = onMouseDown;
    canvas.onmouseup = onMouseUp;
    canvas.onmousemove = onMouseMove;
    canvas.onmouseout = onMouseOut;
  }

  render() {
    logger.trace('render');
    return <canvas id={canvasId} />;
  }
}

export default InteractiveLayer;
