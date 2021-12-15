import React from 'react';
import { boardSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('MoveList');

const getMoveNumber = (whiteMove, moveNumber) => (whiteMove.includes('resign') ? null : `${moveNumber}.`);

const getMove = (whiteMove, blackMove, moveNumber) => (
  <div className="move" key={moveNumber}>
    <div className="move-number">{getMoveNumber(whiteMove, moveNumber)}</div>
    <div className="move-symbol">{whiteMove}</div>
    <div className="move-symbol">{blackMove}</div>
  </div>
);

export const getMoves = ({ pgn2 }) => {
  logger.trace('getMoves');
  const { white, black } = pgn2;
  return white.map((whiteMove, i) => getMove(whiteMove, black[i], (i + 1)));
};

const MoveList = ({ game }) => {
  logger.trace('render');
  const height = boardSize;
  const moves = getMoves(game);
  return (
    <div className="aside move-list" style={{ height }}>
      {moves}
    </div>
  );
};

export default MoveList;
