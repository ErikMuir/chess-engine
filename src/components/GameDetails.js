import React from 'react';
import MoveList from './MoveList';
import MoveConfirmation from './MoveConfirmation';
import MoveNavigation from './MoveNavigation';
import { boardSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('GameDetails');

const GameDetails = ({
  moveBackward,
  moveForward,
  confirmMove,
  cancelMove,
  game: {
    tempMove,
    pgn,
    activePlayer,
    currentMove,
  },
}) => {
  logger.trace('render');

  const controls = tempMove
    ? <MoveConfirmation confirmMove={confirmMove} cancelMove={cancelMove} />
    : (
      <MoveNavigation
        pgn={pgn}
        activePlayer={activePlayer}
        currentMove={currentMove}
        moveBackward={moveBackward}
        moveForward={moveForward}
      />
    );

  return (
    <div className="aside game-details" style={{ height: boardSize }}>
      <MoveList pgn={pgn} currentMove={currentMove} />
      <div className="move-controls">{controls}</div>
    </div>
  );
};

export default GameDetails;
