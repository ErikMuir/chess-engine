import React from 'react';
import DragLayer from './DragLayer';
import { boardSize } from '../../game/utils';
import Logger from '../../Logger';

const logger = new Logger('InteractiveLayer');
const canvasId = 'interactive-layer';

class InteractiveLayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dragPiece: props.dragPiece,
      dragX: null,
      dragY: null,
    };
  }

  componentDidMount() {
    logger.trace('componentDidMount');
    const {
      onMouseDown,
      onMouseUp,
      onMouseOut,
    } = this.props;
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    canvas.onmousedown = onMouseDown;
    canvas.onmouseup = onMouseUp;
    canvas.onmouseout = onMouseOut;
    canvas.onmousemove = this.onMouseMove;
  }

  static getDerivedStateFromProps(props, state) {
    const { dragPiece } = props;
    return dragPiece === state.dragPiece ? null : { dragPiece };
  }

  onMouseMove = (event) => {
    const { dragPiece } = this.state;
    if (!dragPiece) return;
    this.setState({
      dragX: event.offsetX,
      dragY: event.offsetY,
    });
  };

  getDragLayer = () => {
    const { dragPiece, dragX, dragY } = this.state;
    return dragPiece
      ? (
        <DragLayer
          dragPiece={dragPiece}
          dragX={dragX}
          dragY={dragY}
        />
      ) : null;
  };

  render() {
    logger.trace('render');
    return (
      <>
        {this.getDragLayer()}
        <canvas id={canvasId} />
      </>
    );
  }
}

export default InteractiveLayer;
