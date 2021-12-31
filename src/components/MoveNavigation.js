import React from 'react';
import Icon from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { iconColor } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('MoveNavigation');

const MoveNavigation = ({
  currentMoveIndex,
  moveCount,
  moveBackward,
  moveForward,
}) => {
  logger.trace('render');

  const handleBackward = (e) => {
    logger.trace('handleBackward');
    moveBackward();
    e.currentTarget.blur();
  };

  const handleForward = (e) => {
    logger.trace('handleForward');
    moveForward();
    e.currentTarget.blur();
  };

  const backwardDisabled = currentMoveIndex === 0;
  const forwardDisabled = currentMoveIndex === moveCount;
  return (
    <>
      <div>
        <button type="button" onClick={handleBackward} title="Go back" disabled={backwardDisabled}>
          <Icon path={mdiChevronLeft} size={1.5} color={iconColor} />
        </button>
      </div>
      <div>
        <button type="button" onClick={handleForward} title="Go forward" disabled={forwardDisabled}>
          <Icon path={mdiChevronRight} size={1.5} color={iconColor} />
        </button>
      </div>
    </>
  );
};

export default MoveNavigation;
