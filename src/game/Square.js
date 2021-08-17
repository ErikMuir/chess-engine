import { lightColor, darkColor, squareSize } from './utils';

export default class Square {
  constructor(file, rank) {
    this.file = file;
    this.rank = rank;
    this.piece = null;
    this.index = rank * 8 + file;
    this.isLightSquare = (file + rank) % 2 === 1;
  }

  get squareColor() {
    return this.isLightSquare ? lightColor : darkColor;
  }

  get textColor() {
    return this.isLightSquare ? darkColor : lightColor;
  }

  get xPos() {
    return this.file * squareSize;
  }

  get yPos() {
    return (squareSize * 7) - (this.rank * squareSize);
  }

  get coordinates() {
    return `${'abcdefgh'[this.file]}${this.rank + 1}`;
  }
}
