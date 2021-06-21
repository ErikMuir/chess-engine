import React from 'react';
import Game from '../game/Game';
import CanvasContainer from './CanvasContainer';

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game: new Game(),
    };
  }

  componentDidMount() {

  }

  render() {
    const { game } = this.state;
    return (
      <CanvasContainer
        game={game}
        draw={null}
        onClick={null}
      />
    );
  }
}

export default Board;
