import React from 'react';
import { boardSize } from '../game/utils';
import MoveList from './MoveList';
import MoveControls from './MoveControls';
import Logger from '../Logger';

const logger = new Logger('GameDetails');

const GameDetails = ({ game, updateApp }) => {
  logger.trace('render');

  return (
    <div className="aside game-details" style={{ height: boardSize }}>
      <MoveList game={game} />
      <MoveControls game={game} updateApp={updateApp} />
    </div>
  );
};

export default GameDetails;
