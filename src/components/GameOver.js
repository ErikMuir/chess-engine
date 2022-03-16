import React from 'react';
import { useRecoilValue } from 'recoil';
import Modal from 'react-modal';
import gameState from '../state/atoms/gameState';
import { getColorString, oppositeColor } from '../engine/PieceColors';
import { modalOverlayStyle, modalContentStyle } from '../engine/utils';

const getMessage = () => {
  const {
    isResignation,
    isCheckmate,
    activePlayer,
    fullMoveNumber,
  } = useRecoilValue(gameState);
  const otherPlayer = getColorString(oppositeColor(activePlayer));
  const currentPlayer = getColorString(activePlayer);
  if (isResignation) return `${otherPlayer} wins by resignation.`;
  if (isCheckmate) return `${otherPlayer} mated ${currentPlayer} in ${fullMoveNumber} moves.`;
  return `${currentPlayer} is not in check but has no legal moves, therefore it is a stalemate.`;
};

const GameOver = ({ closeGameOverModal }) => (
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
      <div className="modal__content">{getMessage()}</div>
    </main>
  </Modal>
);

export default GameOver;
