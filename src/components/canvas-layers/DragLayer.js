import React from 'react';
import Canvas from '../Canvas';
import { proportion } from '../../game/utils';
import { boardSize } from '../../game/constants';
import { clearCanvas } from '../../utils/CanvasHelpers';
import Logger from '../../utils/Logger';

const logger = new Logger('DragLayer');
const canvasId = 'drag-layer';

class DragLayer extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor');
    const { hoverX, hoverY } = props;
    this.state = {
      ctx: null,
      hoverX,
      hoverY,
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
    return props.hoverX === state.hoverX && props.hoverY === state.hoverY
      ? null
      : { hoverX: props.hoverX, hoverY: props.hoverY };
  }

  draw = () => {
    const { ctx, hoverX, hoverY } = this.state;
    const { dragPiece } = this.props;
    if (ctx) {
      clearCanvas(ctx);
      const size = proportion(0.8);
      const x = hoverX - (size / 2);
      const y = hoverY - (size / 2);
      dragPiece.getImage()
        .then((img) => ctx.drawImage(img, x, y, size, size));
    }
  };

  render() {
    return <Canvas draw={this.draw} canvasId={canvasId} />;
  }
}

export default DragLayer;
