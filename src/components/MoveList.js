import React from 'react';
import { boardSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('MoveList');

const getMoveNumber = (whiteMove, moveNumber) => (whiteMove.includes('resign') ? null : `${moveNumber}.`);

const getMove = (whiteMove, blackMove, moveNumber) => (
  <div className="move" key={moveNumber}>
    <div className="move-number">{getMoveNumber(whiteMove, moveNumber)}</div>
    <div className="move-symbol">{whiteMove}</div>
    <div className="move-symbol">{blackMove}</div>
  </div>
);

export const getMoves = ({ pgn }) => {
  logger.trace('getMoves');
  const { white, black } = pgn;
  return white.map((whiteMove, i) => getMove(whiteMove, black[i], (i + 1)));
};

class MoveList extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor');
    const { game } = props;
    this.state = { game };
  }

  static getDerivedStateFromProps(props, state) {
    const { game } = props;
    return game === state.game ? null : { game };
  }

  render() {
    logger.trace('render');
    const { game } = this.state;
    const height = boardSize;
    const moves = getMoves(game);
    return (
      <div className="aside move-list" style={{ height }}>
        {moves}
      </div>
    );
  }
}

export default MoveList;
