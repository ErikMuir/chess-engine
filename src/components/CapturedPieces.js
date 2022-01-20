import React from 'react';
import Piece from '../game/Piece';
import { black, white, pieceColorFromPieceId } from '../game/PieceColors';
import { pieceTypeFromPieceId } from '../game/PieceTypes';
import { clearCanvas } from '../utils';
import Logger from '../Logger';

const logger = new Logger('CapturedPieces');
const blackCanvasId = 'captured-black-pieces-canvas';
const whiteCanvasId = 'captured-white-pieces-canvas';
const pieceSize = 20;

class CapturedPieces extends React.Component {
  static filterByColor(pieces, color) {
    if (!pieces || !pieces.length) return [];
    const isDescending = color === white;
    return pieces
      .filter((pieceId) => pieceColorFromPieceId(pieceId) === color)
      .sort((a, b) => {
        const aType = pieceTypeFromPieceId(a);
        const bType = pieceTypeFromPieceId(b);
        let diff = isDescending
          ? bType.value - aType.value
          : aType.value - bType.value;
        if (diff === 0) {
          diff = isDescending
            ? bType.id - aType.id
            : aType.id - bType.id;
        }
        return diff;
      });
  }

  constructor(props) {
    super(props);
    logger.trace('ctor');
    const { capturedPieces } = this.props;
    this.state = {
      blackCtx: null,
      whiteCtx: null,
      blackPieces: CapturedPieces.filterByColor(capturedPieces, black),
      whitePieces: CapturedPieces.filterByColor(capturedPieces, white),
    };
  }

  componentDidMount() {
    logger.trace('componentDidMount');
    const { blackPieces, whitePieces } = this.state;
    const blackWidth = pieceSize * blackPieces.length;
    const whiteWidth = pieceSize * whitePieces.length;
    const blackCanvas = document.getElementById(blackCanvasId);
    const whiteCanvas = document.getElementById(whiteCanvasId);
    blackCanvas.height = pieceSize;
    blackCanvas.width = blackWidth;
    whiteCanvas.height = pieceSize;
    whiteCanvas.width = whiteWidth;
    const blackCtx = blackCanvas.getContext('2d');
    const whiteCtx = whiteCanvas.getContext('2d');
    this.setState({ blackCtx, whiteCtx });
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.state !== prevState) {
      this.draw();
    }
  }

  static getDerivedStateFromProps(props, state) {
    const { capturedPieces } = props;
    const blackPieces = CapturedPieces.filterByColor(capturedPieces, black);
    const whitePieces = CapturedPieces.filterByColor(capturedPieces, white);
    return blackPieces === state.blackPieces && whitePieces === state.whitePieces
      ? null
      : { blackPieces, whitePieces };
  }

  resizeCanvas = (canvasId, pieces) => {
    const canvas = document.getElementById(canvasId);
    canvas.height = pieceSize;
    canvas.width = pieceSize * pieces.length;
  };

  drawPieces = (pieces, ctx, canvasId) => {
    clearCanvas(ctx);
    this.resizeCanvas(canvasId, pieces);
    pieces.forEach((pieceId, index) => {
      Piece
        .fromPieceId(pieceId)
        .getImage()
        .then((img) => ctx.drawImage(img, pieceSize * index, 0, pieceSize, pieceSize));
    });
  };

  draw = () => {
    const {
      blackCtx,
      whiteCtx,
      blackPieces,
      whitePieces,
    } = this.state;
    this.drawPieces(blackPieces, blackCtx, blackCanvasId);
    this.drawPieces(whitePieces, whiteCtx, whiteCanvasId);
  };

  render() {
    logger.trace('render');
    const { blackPieces, whitePieces } = this.state;
    const blackWidth = pieceSize * blackPieces.length;
    const whiteWidth = pieceSize * whitePieces.length;
    return (
      <div className="captured-pieces">
        <div className="canvas-container" style={{ height: pieceSize, width: blackWidth }}>
          <canvas id={blackCanvasId} />
        </div>
        <div className="canvas-container" style={{ height: pieceSize, width: whiteWidth }}>
          <canvas id={whiteCanvasId} />
        </div>
      </div>
    );
  }
}

export default CapturedPieces;
