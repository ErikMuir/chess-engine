import React from 'react';
import Icon from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { boardSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('MoveList');

class MoveControls extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor');
  }

  handleBack = (e) => {
    logger.trace('handleBack');
    const { moveBack } = this.props; // TODO : implement in Game
    moveBack();
    e.currentTarget.blur();
  };

  handleForward = (e) => {
    logger.trace('handleForward');
    const { moveForward } = this.props; // TODO : implement in Game
    moveForward();
    e.currentTarget.blur();
  };

  getMove = (move, moveNumber, currentMove = 0) => {
    const moveNumberText = move.white.includes('resign') ? null : `${moveNumber}.`;
    const moveDiff = currentMove - moveNumber;
    const whiteMoveStyle = moveDiff === 0 ? 'current-move' : null;
    const blackMoveStyle = moveDiff === 0.5 ? 'current-move' : null;
    return (
      <div className="move" key={moveNumber}>
        <div className="move-number">{moveNumberText}</div>
        <div className="move-symbol">
          <span className={whiteMoveStyle}>{move.white}</span>
        </div>
        <div className="move-symbol">
          <span className={blackMoveStyle}>{move.black}</span>
        </div>
      </div>
    );
  };

  render() {
    logger.trace('render');
    const { game } = this.props;
    const { pgn, currentMove } = game;
    // TODO : handle navigation button enabled state
    return (
      <div className="aside move-controls" style={{ height: boardSize }}>
        <div className="move-list">
          {pgn.map((move, i) => this.getMove(move, (i + 1), currentMove))}
        </div>
        <div className="move-navigation">
          <div>
            <button type="button" onClick={this.handleBack} title="Go back">
              <Icon path={mdiChevronLeft} size={1.5} color="#eeeeee" />
            </button>
          </div>
          <div>
            <button type="button" onClick={this.handleForward} title="Go forward">
              <Icon path={mdiChevronRight} size={1.5} color="#eeeeee" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default MoveControls;
