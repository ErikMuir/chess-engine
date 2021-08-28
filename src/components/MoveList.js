import React from 'react';
import { boardSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('MoveList');

export const getMoves = ({ pgn }) => {
  logger.trace('getMoves');
  const { white, black } = pgn;
  return white.map((whiteMove, i) => {
    const number = `${i + 1}.`;
    const blackMove = black[i];
    return (
      <div className="move" key={`${i + 1}`}>
        <span className="move-number">{number}</span>
        <span>{whiteMove}</span>
        <span>{blackMove}</span>
      </div>
    );
  });
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
    return (
      <div className="aside move-list" style={{ height }}>
        {getMoves(game)}
      </div>
    );
  }
}

export default MoveList;
