import React from 'react';
import Icon from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { iconColor } from '../engine/utils';

const MoveNavigation = ({
  currentMoveIndex,
  moveCount,
  moveBackward,
  moveForward,
}) => {
  const handleBackward = (e) => {
    moveBackward();
    e.currentTarget.blur();
  };

  const handleForward = (e) => {
    moveForward();
    e.currentTarget.blur();
  };

  const backwardDisabled = currentMoveIndex === 0;
  const forwardDisabled = currentMoveIndex === moveCount;
  return (
    <div className="move-navigation">
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
    </div>
  );
};

export default MoveNavigation;
