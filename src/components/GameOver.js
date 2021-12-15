import React from 'react';
import Modal from 'react-modal';
import PieceColor from '../game/PieceColor';
import { squareSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('GameOver');

const getMessage = ({
  isResignation, isCheckmate, activePlayer, fullMoveNumber,
}) => {
  const otherPlayer = PieceColor.toString(PieceColor.opposite(activePlayer));
  const currentPlayer = PieceColor.toString(activePlayer);
  if (isResignation) return `${otherPlayer} wins by resignation.`;
  if (isCheckmate) return `${otherPlayer} mated ${currentPlayer} in ${fullMoveNumber} moves.`;
  return `${currentPlayer} is not in check but has no legal moves, therefore it is a draw.`;
};

const getOverlayStyle = () => ({
  position: 'fixed',
  top: 0,
  left: -1000,
  right: -1000,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
});

const getContentStyle = () => ({
  backgroundColor: 'transparent',
  padding: 0,
  height: '75vh',
  maxWidth: '500px',
  borderRadius: 0,
  overflow: 'hidden',
  boxSizing: 'border-box',
  position: 'relative',
  inset: 0,
  marginTop: `${squareSize * 4}px`,
  marginLeft: 'auto',
  marginRight: 'auto',
  border: 'none',
  outline: 'none',
});

const GameOver = ({ game, closeGameOverModal }) => {
  logger.trace('render');
  return (
    <Modal
      isOpen
      onRequestClose={closeGameOverModal}
      style={{ overlay: getOverlayStyle(), content: getContentStyle() }}
    >
      <header className="modal__header">
        <h2 className="modal__title">Game Over</h2>
        <button
          type="button"
          className="modal__close"
          aria-label="Close modal"
          onClick={closeGameOverModal}
        />
      </header>
      <main className="modal__content-container">
        <div className="modal__content">{getMessage(game)}</div>
      </main>
    </Modal>
  );
};

export default GameOver;
