import React from 'react';
import MoveList from './MoveList';
import MoveConfirmation from './MoveConfirmation';
import MoveNavigation from './MoveNavigation';
import { boardSize } from '../game/utils';

const GameDetails = ({
  moveBackward,
  moveForward,
  moveJump,
  confirmMove,
  cancelMove,
  game: {
    tempMove,
    pgn,
    currentMoveIndex,
    moveHistory,
  },
}) => {
  const controls = tempMove
    ? (
      <MoveConfirmation
        confirmMove={confirmMove}
        cancelMove={cancelMove}
      />
    )
    : (
      <MoveNavigation
        currentMoveIndex={currentMoveIndex}
        moveCount={moveHistory.length}
        moveBackward={moveBackward}
        moveForward={moveForward}
      />
    );

  return (
    <div className="aside game-details" style={{ height: boardSize }}>
      <MoveList pgn={pgn} currentMoveIndex={currentMoveIndex} moveJump={moveJump} />
      <div className="move-controls">{controls}</div>
    </div>
  );
};

export default GameDetails;
