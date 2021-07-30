import { lightColor, darkColor, squareSize } from './constants';
import Logger from '../utils/Logger';

const logger = new Logger('Square');

export default class Square {
  constructor(file, rank) {
    logger.trace('Square.ctor', { file, rank });
    this.file = file;
    this.rank = rank;
    this.piece = null;
    this.index = rank * 8 + file;
    this.isLightSquare = (file + rank) % 2 === 1;
  }

  get squareColor() {
    logger.trace('Square.squareColor');
    return this.isLightSquare ? lightColor : darkColor;
  }

  get textColor() {
    logger.trace('Square.textColor');
    return this.isLightSquare ? darkColor : lightColor;
  }

  get xPos() {
    logger.trace('Square.xPos');
    return this.file * squareSize;
  }

  get yPos() {
    logger.trace('Square.yPos');
    return (squareSize * 7) - (this.rank * squareSize);
  }

  get coordinates() {
    logger.trace('Square.coordinates');
    return `${'abcdefgh'[this.file]}${this.rank + 1}`;
  }
}
