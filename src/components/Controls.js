import React from 'react';
import { boardSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('Controls');

class Controls extends React.Component {
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
    const height = boardSize;
    return <div className="aside controls" style={{ height }} />;
  }
}

export default Controls;
