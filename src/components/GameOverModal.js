import React from 'react';
import Modal from 'react-modal';
import PieceColor from '../game/PieceColor';
import { squareSize } from '../game/utils';

class GameOverModal extends React.Component {
  getCheckmateMessage = () => {
    const { game } = this.props;
    const { activePlayer, fullMoveNumber } = game;
    const winner = PieceColor.toString(PieceColor.opposite(activePlayer));
    const loser = PieceColor.toString(activePlayer);
    const moveCount = fullMoveNumber;
    return `${winner} mated ${loser} in ${moveCount} moves.`;
  };

  getStalemateMessage = () => {
    const { game } = this.props;
    const activePlayer = PieceColor.toString(game.activePlayer);
    return `${activePlayer} is not in check but has no legal moves, therefore it is a draw.`;
  };

  getOverlayStyle = () => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  });

  getContentStyle = () => ({
    backgroundColor: 'transparent',
    padding: 0,
    maxWidth: '740px',
    height: '75vh',
    width: '50%',
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

  render() {
    const { game, closeGameOverModal } = this.props;
    const title = game.isCheckmate ? 'Checkmate' : 'Stalemate';
    const message = game.isCheckmate ? this.getCheckmateMessage() : this.getStalemateMessage();
    const overlay = this.getOverlayStyle();
    const content = this.getContentStyle();
    const style = { overlay, content };
    return (
      <Modal
        isOpen
        onRequestClose={closeGameOverModal}
        style={style}
      >
        <header className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button
            type="button"
            className="modal__close"
            aria-label="Close modal"
            onClick={closeGameOverModal}
          />
        </header>
        <main className="modal__content-container">
          <div className="modal__content">
            <p>{message}</p>
            <p>{game.pgn}</p>
          </div>
          <footer className="modal__footer">
            <button
              type="button"
              className="modal__btn"
              aria-label="Close modal"
              onClick={closeGameOverModal}
            >
              Close
            </button>
          </footer>
        </main>
      </Modal>
    );
  }
}

export default GameOverModal;
