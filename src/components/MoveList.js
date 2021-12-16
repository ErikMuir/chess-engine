import React from 'react';
import { boardSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('MoveList');

const getMoveNumber = (whiteMove, moveNumber) => (whiteMove.includes('resign') ? null : `${moveNumber}.`);

const getMove = (move, moveNumber) => (
  <div className="move" key={moveNumber}>
    <div className="move-number">{getMoveNumber(move.white, moveNumber)}</div>
    <div className="move-symbol">{move.white}</div>
    <div className="move-symbol">{move.black}</div>
  </div>
);

export const getMoves = ({ pgn }) => pgn.map((move, i) => getMove(move, (i + 1)));

const MoveList = ({ game }) => {
  logger.trace('render');
  return (
    <div className="aside move-list" style={{ height: boardSize }}>
      {getMoves(game)}
    </div>
  );
};

export default MoveList;
