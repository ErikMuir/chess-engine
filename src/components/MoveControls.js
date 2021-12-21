import React from 'react';
import Icon from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import Logger from '../Logger';

const logger = new Logger('MoveControls');

const MoveControls = ({ game, updateApp }) => {
  logger.trace('render');

  const handleBack = (e) => {
    logger.trace('handleBack');
    const { moveBack } = game;
    moveBack();
    e.currentTarget.blur();
    updateApp(game);
  };

  const handleForward = (e) => {
    logger.trace('handleForward');
    const { moveForward } = game;
    moveForward();
    e.currentTarget.blur();
    updateApp(game);
  };

  const { pgn, activePlayer, currentMove } = game;
  const { moveNumber, pieceColor } = currentMove;
  const backDisabled = moveNumber === 0;
  const forwardDisabled = moveNumber === pgn.length && pieceColor !== activePlayer;
  const backColor = backDisabled ? '#444444' : '#eeeeee';
  const forwardColor = forwardDisabled ? '#444444' : '#eeeeee';
  return (
    <div className="move-controls">
      <div>
        <button type="button" onClick={handleBack} title="Go back" disabled={backDisabled}>
          <Icon path={mdiChevronLeft} size={1.5} color={backColor} />
        </button>
      </div>
      <div>
        <button type="button" onClick={handleForward} title="Go forward" disabled={forwardDisabled}>
          <Icon path={mdiChevronRight} size={1.5} color={forwardColor} />
        </button>
      </div>
    </div>
  );
};

export default MoveControls;
