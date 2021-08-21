import React from 'react';
import Canvas from '../Canvas';
import { boardSize, proportion } from '../../game/utils';
import { clearCanvas } from '../../utils';
import Logger from '../../Logger';

const logger = new Logger('DragLayer');
const canvasId = 'drag-layer';

class DragLayer extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor');
    const { dragX, dragY } = props;
    this.state = {
      dragX,
      dragY,
      ctx: null,
    };
    this.draw = this.draw.bind(this);
  }

  componentDidMount() {
    logger.trace('componentDidMount');
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    const ctx = canvas.getContext('2d');
    this.setState({ ctx });
  }

  componentWillUnmount() {
    logger.trace('componentWillUnmount');
  }

  static getDerivedStateFromProps(props, state) {
    const { dragX, dragY } = props;
    return dragX === state.dragX && dragY === state.dragY ? null : { dragX, dragY };
  }

  draw = () => {
    const { ctx, dragX, dragY } = this.state;
    const { dragPiece } = this.props;
    if (ctx) {
      clearCanvas(ctx);
      const size = proportion(0.8);
      const x = dragX - (size / 2);
      const y = dragY - (size / 2);
      dragPiece.getImage()
        .then((img) => ctx.drawImage(img, x, y, size, size));
    }
  };

  render() {
    return <Canvas draw={this.draw} canvasId={canvasId} />;
  }
}

export default DragLayer;
