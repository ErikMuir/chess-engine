import React from 'react';
import { useRecoilValue } from 'recoil';
import Icon from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import gameState from '../state/atoms/gameState';
import { iconColor } from '../engine/utils';

const MoveNavigation = ({ moveBackward, moveForward }) => {
  const { currentMoveIndex, moveHistory } = useRecoilValue(gameState);

  const handleBackward = (e) => {
    moveBackward();
    e.currentTarget.blur();
  };

  const handleForward = (e) => {
    moveForward();
    e.currentTarget.blur();
  };

  const backwardDisabled = currentMoveIndex === 0;
  const forwardDisabled = currentMoveIndex === moveHistory.length;
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
