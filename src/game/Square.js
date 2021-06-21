import { proportion } from './utils';
import {
  lightColor,
  darkColor,
  squareSize,
  activeOverlay,
  previousOverlay,
  possibleOverlay,
  overlayOpacity,
} from './constants';

export default class Square {
  constructor(file, rank, board) {
    this.file = file;
    this.rank = rank;
    this.board = board;
    this.piece = null;
    this.index = rank * 8 + file;
    this.isLightSquare = (file + rank) % 2 === 1;
  }

  get squareColor() { return this.isLightSquare ? lightColor : darkColor; }

  get textColor() { return this.isLightSquare ? darkColor : lightColor; }

  get xPos() { return this.file * squareSize; }

  get yPos() { return (squareSize * 7) - (this.rank * squareSize); }

  get coordinates() { return `${'abcdefgh'[this.file]}${this.rank + 1}`; }

  getPieceImage = () => this.board.getPieceImage(this.piece);

  draw = (ctx) => {
    const { activeSquare, possibleSquares, previousMove } = this.board;

    this.drawBackground(ctx);

    if (this.file === 0) {
      this.drawRankLabel(ctx);
    }

    if (this.rank === 0) {
      this.drawFileLabel(ctx);
    }

    if ([activeSquare].includes(this)) {
      this.drawActiveOverlay(ctx);
    }

    if (previousMove && [previousMove.fromIndex, previousMove.toIndex].includes(this.index)) {
      this.drawPreviousOverlay(ctx);
    }

    if (this.piece) {
      this.drawPiece(ctx);
    }

    if (possibleSquares.includes(this.index)) {
      this.drawPossibleOverlay(ctx);
    }
  };

  drawBackground = (ctx) => {
    ctx.fillStyle = this.squareColor;
    ctx.fillRect(this.xPos, this.yPos, squareSize, squareSize);
  };

  drawRankLabel = (ctx) => {
    const rankText = `${this.rank + 1}`;
    const x = this.xPos + proportion(0.05);
    const y = this.yPos + proportion(0.2);
    ctx.fillStyle = this.textColor;
    ctx.font = `400 ${proportion(0.175)}px sans-serif`;
    ctx.fillText(rankText, x, y);
  };

  drawFileLabel = (ctx) => {
    const fileText = 'abcdefgh'[this.file];
    const x = this.xPos + squareSize - proportion(0.15);
    const y = this.yPos + squareSize - proportion(0.075);
    ctx.fillStyle = this.textColor;
    ctx.font = `400 ${proportion(0.175)}px sans-serif`;
    ctx.fillText(fileText, x, y);
  };

  drawActiveOverlay = (ctx) => {
    ctx.fillStyle = activeOverlay;
    ctx.globalAlpha = overlayOpacity;
    ctx.fillRect(this.xPos, this.yPos, squareSize, squareSize);
    ctx.globalAlpha = 1.0;
  };

  drawPreviousOverlay = (ctx) => {
    ctx.fillStyle = previousOverlay;
    ctx.globalAlpha = overlayOpacity;
    ctx.fillRect(this.xPos, this.yPos, squareSize, squareSize);
    ctx.globalAlpha = 1.0;
  };

  drawPossibleOverlay = (ctx) => {
    if (this.piece) {
      this.drawPossibleOverlayOccupied(ctx);
    } else {
      this.drawPossibleOverlayEmpty(ctx);
    }
  };

  drawPossibleOverlayEmpty = (ctx) => {
    const offset = proportion(0.5);
    const radius = proportion(0.17);
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(this.xPos + offset, this.yPos + offset, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = possibleOverlay;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  };

  drawPossibleOverlayOccupied = (ctx) => {
    const offset = proportion(0.5);
    const radius = proportion(0.46);
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(this.xPos + offset, this.yPos + offset, radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 7;
    ctx.strokeStyle = possibleOverlay;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  };

  drawPiece = (ctx) => {
    const img = this.getPieceImage();
    const offset = proportion(0.1);
    const size = proportion(0.8);
    const x = this.xPos + offset;
    const y = this.yPos + offset;
    ctx.drawImage(img, x, y, size, size);
  };
}
