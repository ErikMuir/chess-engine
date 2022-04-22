/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import gameState from '../state/atoms/gameState';
import moveIndexState from '../state/atoms/moveIndexState';
import * as pieceColors from '../engine/PieceColors';
import { getMovesFromPgn } from '../engine/utils';
import Logger from '../Logger';

const log = new Logger('MoveList');

const MoveList = () => {
  const currentMoveRef = useRef(null);
  const { pgn } = useRecoilValue(gameState);
  const [moveIndex, setMoveIndex] = useRecoilState(moveIndexState);
  log.debug({ pgn, moveIndex });

  const scrollToBottom = () => {
    currentMoveRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [moveIndex]);

  const handleMoveJump = (e) => {
    const toIndex = parseInt(e.target.dataset.moveindex, 10);
    setMoveIndex(toIndex);
  };

  const getMove = (move, moveNumber) => {
    const { white, black, score } = move;
    const getMoveNumber = () => (white ? `${moveNumber}.` : null);
    const getPlayerMove = (pieceColor) => {
      const pgnMove = pieceColor === pieceColors.white
        ? white || score : white
          ? black || score : null;
      const index = pieceColor === pieceColors.white
        ? (moveNumber * 2) - 1
        : moveNumber * 2;
      return index === moveIndex
        ? (
          <button
            type="button"
            onClick={handleMoveJump}
            data-moveindex={index}
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
            data-moveindex={index}
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
