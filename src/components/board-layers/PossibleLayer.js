import React from 'react';
import { boardSize, possibleOverlay, proportion } from '../../game/utils';
import { clearCanvas } from '../../utils';
import Logger from '../../Logger';

const logger = new Logger('PossibleLayer');
const canvasId = 'possible-layer';

class PossibleLayer extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor');
    this.state = {
      ctx: null,
      possibleSquares: props.possibleSquares,
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
    if (this.state !== prevState) {
      this.draw();
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { possibleSquares } = props;
    return possibleSquares === state.possibleSquares ? null : { possibleSquares };
  }

  draw = () => {
    const { ctx, possibleSquares } = this.state;
    clearCanvas(ctx);
    possibleSquares
      .forEach((sq) => {
        const offset = proportion(0.5);
        const radius = sq.piece ? proportion(0.46) : proportion(0.17);
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(sq.xPos + offset, sq.yPos + offset, radius, 0, 2 * Math.PI, false);
        if (sq.piece) {
          ctx.lineWidth = 7;
          ctx.strokeStyle = possibleOverlay;
          ctx.stroke();
        } else {
          ctx.fillStyle = possibleOverlay;
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      });
    possibleSquares
      .filter((sq) => sq.piece)
      .forEach((sq) => {
        const offset = proportion(0.1);
        const size = proportion(0.8);
        const x = sq.xPos + offset;
        const y = sq.yPos + offset;
        sq.piece.getImage()
          .then((img) => ctx.drawImage(img, x, y, size, size));
      });
  };

  render() {
    logger.trace('render');
    return <canvas id={canvasId} />;
  }
}

export default PossibleLayer;
