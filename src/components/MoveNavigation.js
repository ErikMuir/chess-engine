import React from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import Icon from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { gameState, moveIndexState } from '../state';
import { iconColor } from '../engine';

const MoveNavigation = () => {
  const { moveHistory } = useRecoilValue(gameState);
  const [moveIndex, setMoveIndex] = useRecoilState(moveIndexState);

  const handleBackward = (e) => {
    setMoveIndex(moveIndex - 1);
    e.currentTarget.blur();
  };

  const handleForward = (e) => {
    setMoveIndex(moveIndex + 1);
    e.currentTarget.blur();
  };

  const backwardDisabled = moveIndex === 0;
  const forwardDisabled = moveIndex === moveHistory.length;
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
