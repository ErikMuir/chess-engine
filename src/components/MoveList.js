/* eslint-disable no-nested-ternary */
import React, { useEffect, useRef } from 'react';
import PieceColor from '../game/PieceColor';
import { scorePattern } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('MoveList');

const MoveList = ({ pgn, currentMoveIndex, moveJump }) => {
  logger.trace('render');

  const currentMoveRef = useRef(null);

  const scrollToBottom = () => {
    logger.trace('scrollToBottom');
    currentMoveRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [pgn, currentMoveIndex]);

  const handleMoveJump = (e) => {
    logger.trace('handleMoveJump');
    const moveIndex = parseInt(e.target.dataset.moveindex, 10);
    moveJump(moveIndex);
  };

  const getMove = (move, moveNumber) => {
    const { white, black, score } = move;
    const getMoveNumber = () => (white ? `${moveNumber}.` : null);
    const getPlayerMove = (pieceColor) => {
      const pgnMove = pieceColor === PieceColor.white
        ? white || score : white
          ? black || score : null;
      const moveIndex = pieceColor === PieceColor.white
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
        <div className="move-symbol">{getPlayerMove(PieceColor.white)}</div>
        <div className="move-symbol">{getPlayerMove(PieceColor.black)}</div>
      </div>
    );
  };

  const moves = [];
  for (let i = 0; i < pgn.length; i += 2) {
    if (i % 2 === 0) {
      const pgnMove = {};
      const white = pgn[i];
      const black = pgn[i + 1];
      if (white.match(scorePattern)) {
        pgnMove.score = white;
      } else {
        pgnMove.white = white;
      }
      if (black) {
        if (black.match(scorePattern)) {
          pgnMove.score = black;
        } else {
          pgnMove.black = black;
        }
      }
      moves.push(pgnMove);
    }
  }

  return (
    <div className="move-list">
      {moves.map((move, i) => getMove(move, (i + 1)))}
    </div>
  );
};

export default MoveList;
