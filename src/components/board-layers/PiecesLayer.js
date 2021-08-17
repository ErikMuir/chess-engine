import React from 'react';
import { proportion, boardSize } from '../../game/utils';
import { clearCanvas, sleep } from '../../utils';
import Logger from '../../Logger';

const logger = new Logger('PiecesLayer');
const canvasId = 'pieces-layer';

class PiecesLayer extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor', { props });
    this.state = {
      ctx: null,
      piecesSquares: PiecesLayer.getPiecesSquares(props.squares),
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

  async componentDidUpdate(prevProps, prevState) {
    if (this.state !== prevState) {
      await sleep(10); // wtf? moves will duplicate pieces without this. maybe debounce instead?
      this.draw();
    }
  }

  static getDerivedStateFromProps(props, state) {
    return props.squares === state.squares
      ? null
      : { piecesSquares: PiecesLayer.getPiecesSquares(props.squares) };
  }

  static getPiecesSquares = (squares) => squares.filter((sq) => sq.piece);

  draw = () => {
    const { piecesSquares, ctx } = this.state;
    clearCanvas(ctx);
    piecesSquares
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

export default PiecesLayer;
