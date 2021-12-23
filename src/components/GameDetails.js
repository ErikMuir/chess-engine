import React from 'react';
import { boardSize } from '../game/utils';
import MoveList from './MoveList';
import MoveConfirmation from './MoveConfirmation';
import MoveNavigation from './MoveNavigation';
import Logger from '../Logger';

const logger = new Logger('GameDetails');

const GameDetails = ({
  game,
  moveBackward,
  moveForward,
  confirmMove,
  cancelMove,
}) => {
  logger.trace('render');

  const { tempMove } = game;
  const controls = tempMove
    ? <MoveConfirmation confirmMove={confirmMove} cancelMove={cancelMove} />
    : <MoveNavigation game={game} moveBackward={moveBackward} moveForward={moveForward} />;

  return (
    <div className="aside game-details" style={{ height: boardSize }}>
      <MoveList game={game} />
      <div className="move-controls">{controls}</div>
    </div>
  );
};

export default GameDetails;
