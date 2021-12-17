import React from 'react';
import Icon from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { boardSize } from '../game/utils';
import Logger from '../Logger';
import PieceColor from '../game/PieceColor';

const logger = new Logger('MoveControls');

class MoveControls extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor');
  }

  handleBack = (e) => {
    logger.trace('handleBack');
    const { game, updateApp } = this.props;
    const { moveBack } = game;
    moveBack();
    e.currentTarget.blur();
    updateApp(game);
  };

  handleForward = (e) => {
    logger.trace('handleForward');
    const { game, updateApp } = this.props;
    const { moveForward } = game;
    moveForward();
    e.currentTarget.blur();
    updateApp(game);
  };

  getMoveStyle = (currentMove, moveNumber, pieceColor) => (
    currentMove.moveNumber === moveNumber && currentMove.pieceColor === pieceColor
      ? 'current-move'
      : null
  );

  getMove = (move, moveNumber, currentMove) => {
    const moveNumberText = move.white.includes('resign') ? null : `${moveNumber}.`;
    const whiteMoveStyle = this.getMoveStyle(currentMove, moveNumber, PieceColor.white);
    const blackMoveStyle = this.getMoveStyle(currentMove, moveNumber, PieceColor.black);
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
    const { pgn, activePlayer, currentMove } = game;
    const { moveNumber, pieceColor } = currentMove;
    const backDisabled = moveNumber === 0;
    const forwardDisabled = moveNumber === pgn.length && pieceColor !== activePlayer;
    const backColor = backDisabled ? '#444444' : '#eeeeee';
    const forwardColor = forwardDisabled ? '#444444' : '#eeeeee';
    logger.trace({
      moveNumber, pieceColor, backDisabled, forwardDisabled, pgn, activePlayer,
    });
    return (
      <div className="aside move-controls" style={{ height: boardSize }}>
        <div className="move-list">
          {pgn.map((move, i) => this.getMove(move, (i + 1), currentMove))}
        </div>
        <div className="move-navigation">
          <div>
            <button type="button" onClick={this.handleBack} title="Go back" disabled={backDisabled}>
              <Icon path={mdiChevronLeft} size={1.5} color={backColor} />
            </button>
          </div>
          <div>
            <button type="button" onClick={this.handleForward} title="Go forward" disabled={forwardDisabled}>
              <Icon path={mdiChevronRight} size={1.5} color={forwardColor} />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default MoveControls;
