import React from 'react';
import Modal from 'react-modal';
import PieceColor from '../game/PieceColor';
import { modalOverlayStyle, modalContentStyle } from '../game/utils';

const getMessage = ({
  isResignation, isCheckmate, activePlayer, fullMoveNumber,
}) => {
  const otherPlayer = PieceColor.toString(PieceColor.opposite(activePlayer));
  const currentPlayer = PieceColor.toString(activePlayer);
  if (isResignation) return `${otherPlayer} wins by resignation.`;
  if (isCheckmate) return `${otherPlayer} mated ${currentPlayer} in ${fullMoveNumber} moves.`;
  return `${currentPlayer} is not in check but has no legal moves, therefore it is a stalemate.`;
};

const GameOver = ({ game, closeGameOverModal }) => (
  <Modal
    isOpen
    onRequestClose={closeGameOverModal}
    style={{ overlay: modalOverlayStyle, content: modalContentStyle }}
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

export default GameOver;
