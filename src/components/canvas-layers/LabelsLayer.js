import React from 'react';
import { squareSize, boardSize } from '../../game/constants';
import { proportion } from '../../game/utils';
import Logger from '../../utils/Logger';

const logger = new Logger('LabelsLayer');
const canvasId = 'labels-layer';

class LabelsLayer extends React.Component {
  componentDidMount() {
    logger.trace('componentDidMount');
    const canvas = document.getElementById(canvasId);
    canvas.width = boardSize;
    canvas.height = boardSize;
    const ctx = canvas.getContext('2d');
    const { squares } = this.props;
    squares.forEach((sq) => {
      if (sq.file === 0) this.drawRank(sq, ctx);
      if (sq.rank === 0) this.drawFile(sq, ctx);
    });
  }

  drawRank = (sq, ctx) => {
    const rankText = `${sq.rank + 1}`;
    const x = sq.xPos + proportion(0.05);
    const y = sq.yPos + proportion(0.2);
    ctx.fillStyle = sq.textColor;
    ctx.font = `400 ${proportion(0.175)}px sans-serif`;
    ctx.fillText(rankText, x, y);
  };

  drawFile = (sq, ctx) => {
    const fileText = 'abcdefgh'[sq.file];
    const x = sq.xPos + squareSize - proportion(0.15);
    const y = sq.yPos + squareSize - proportion(0.075);
    ctx.fillStyle = sq.textColor;
    ctx.font = `400 ${proportion(0.175)}px sans-serif`;
    ctx.fillText(fileText, x, y);
  };

  render() {
    logger.trace('redner');
    return <canvas id={canvasId} />;
  }
}

export default LabelsLayer;
