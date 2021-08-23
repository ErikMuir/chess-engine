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
    const { game: { pgnWhite, pgnBlack } } = this.state;
    return pgnWhite.map((white, i) => {
      const number = `${i + 1}.`;
      const black = pgnBlack[i];
      return (
        <div className="move" key={`${i + 1}`}>
          <span className="move-number">{number}</span>
          <span className="move-white">{white}</span>
          <span className="move-black">{black}</span>
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
