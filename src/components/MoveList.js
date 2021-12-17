import React from 'react';
import { boardSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('MoveList');

const getMove = (move, moveNumber, currentMove = 0) => {
  const moveNumberText = move.white.includes('resign') ? null : `${moveNumber}.`;
  const moveDiff = currentMove - moveNumber;
  const whiteMoveStyle = moveDiff === 0 ? 'current-move' : null;
  const blackMoveStyle = moveDiff === 0.5 ? 'current-move' : null;
  return (
    <div className="move" key={moveNumber}>
      <div className="move-number">{moveNumberText}</div>
      <div className="move-symbol">
        <span className={whiteMoveStyle}>{move.white}</span>
      </div>
      <div className="move-symbol">
        <span className={blackMoveStyle}>{move.black}</span>
      </div>
    </div>
  );
};

const MoveList = ({ game }) => {
  logger.trace('render');
  const { pgn, currentMove } = game;
  const moves = pgn.map((move, i) => getMove(move, (i + 1), currentMove));
  return (
    <div className="aside move-list" style={{ height: boardSize }}>
      {moves}
    </div>
  );
};

export default MoveList;
