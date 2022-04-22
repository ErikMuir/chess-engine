import React from 'react';
import { useRecoilValue } from 'recoil';
import MoveList from './MoveList';
import MoveConfirmation from './MoveConfirmation';
import MoveNavigation from './MoveNavigation';
import tempMoveState from '../state/atoms/tempMoveState';
import { boardSize } from '../engine/utils';

const GameDetails = ({
  confirmMove,
  cancelMove,
}) => {
  const tempMove = useRecoilValue(tempMoveState);

  const controls = tempMove
    ? <MoveConfirmation confirmMove={confirmMove} cancelMove={cancelMove} />
    : <MoveNavigation />;

  return (
    <div className="aside game-details" style={{ height: boardSize }}>
      <MoveList />
      <div className="move-controls">{controls}</div>
    </div>
  );
};

export default GameDetails;
