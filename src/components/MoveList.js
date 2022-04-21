/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import gameState from '../state/atoms/gameState';
import currentMoveIndexState from '../state/selectors/currentMoveIndexState';
import * as pieceColors from '../engine/PieceColors';
import { getMovesFromPgn } from '../engine/utils';
import Logger from '../Logger';

const log = new Logger('MoveList');

const MoveList = ({ moveJump }) => {
  const currentMoveRef = useRef(null);
  const { pgn } = useRecoilValue(gameState);
  const currentMoveIndex = useRecoilValue(currentMoveIndexState);
  log.debug({ pgn, currentMoveIndex });

  const scrollToBottom = () => {
    currentMoveRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [pgn, currentMoveIndex]);

  const handleMoveJump = (e) => {
    const moveIndex = parseInt(e.target.dataset.moveindex, 10);
    moveJump(moveIndex);
  };

  const getMove = (move, moveNumber) => {
    const { white, black, score } = move;
    const getMoveNumber = () => (white ? `${moveNumber}.` : null);
    const getPlayerMove = (pieceColor) => {
      const pgnMove = pieceColor === pieceColors.white
        ? white || score : white
          ? black || score : null;
      const moveIndex = pieceColor === pieceColors.white
        ? (moveNumber * 2) - 1
        : moveNumber * 2;
      return moveIndex === currentMoveIndex
        ? (
          <button
            type="button"
            onClick={handleMoveJump}
            data-moveindex={moveIndex}
            className="current-move"
            ref={currentMoveRef}
          >
            {pgnMove}
          </button>
        )
        : (
          <button
            type="button"
            onClick={handleMoveJump}
            data-moveindex={moveIndex}
          >
            {pgnMove}
          </button>
        );
    };

    return (
      <div className="move" key={moveNumber}>
        <div className="move-number">{getMoveNumber()}</div>
        <div className="move-symbol">{getPlayerMove(pieceColors.white)}</div>
        <div className="move-symbol">{getPlayerMove(pieceColors.black)}</div>
      </div>
    );
  };

  const moves = getMovesFromPgn(pgn);

  return (
    <div className="move-list">
      {moves.map((move, i) => getMove(move, (i + 1)))}
    </div>
  );
};

export default MoveList;
