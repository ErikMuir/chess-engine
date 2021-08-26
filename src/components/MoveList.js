import React from 'react';
import { boardSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('MoveList');

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

  getMoves = () => {
    const { game: { pgn: { white, black } } } = this.state;
    return white.map((whiteMove, i) => {
      const number = `${i + 1}.`;
      const blackMove = black[i];
      return (
        <div className="move" key={`${i + 1}`}>
          <span className="move-number">{number}</span>
          <span className="move-white">{whiteMove}</span>
          <span className="move-black">{blackMove}</span>
        </div>
      );
    });
  };

  render() {
    logger.trace('render');
    const height = boardSize;
    return (
      <div className="aside move-list" style={{ height }}>
        {this.getMoves()}
      </div>
    );
  }
}

export default MoveList;
