import React, { useEffect, useRef } from 'react';
import PieceColor from '../game/PieceColor';
import Logger from '../Logger';

const logger = new Logger('MoveList');

const MoveList = ({ game }) => {
  logger.trace('render');

  const { pgn, currentMove } = game;

  const currentMoveRef = useRef(null);

  const scrollToBottom = () => {
    logger.trace('scrollToBottom');
    currentMoveRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [pgn, currentMove]);

  const getMove = (move, moveNumber) => {
    const getMoveNumber = () => (move.white.includes('resign') ? null : `${moveNumber}.`);
    const getPlayerMove = (pieceColor) => {
      const pgnMove = pieceColor === PieceColor.white ? move.white : move.black;
      return currentMove.moveNumber === moveNumber && currentMove.pieceColor === pieceColor
        ? <span className="current-move" ref={currentMoveRef}>{pgnMove}</span>
        : <span>{pgnMove}</span>;
    };

    return (
      <div className="move" key={moveNumber}>
        <div className="move-number">{getMoveNumber()}</div>
        <div className="move-symbol">{getPlayerMove(PieceColor.white)}</div>
        <div className="move-symbol">{getPlayerMove(PieceColor.black)}</div>
      </div>
    );
  };

  return (
    <div className="move-list">
      {pgn.map((move, i) => getMove(move, (i + 1)))}
    </div>
  );
};

export default MoveList;
