import React from 'react';
import PieceColor from '../game/PieceColor';

const getCheckmateMessage = (game) => {
  const winner = PieceColor.toString(PieceColor.opposite(game.activePlayer));
  const loser = PieceColor.toString(game.activePlayer);
  const moveCount = game.fullMoveNumber;
  return `${winner} mated ${loser} in ${moveCount} moves.`;
};

const getStalemateMessage = (game) => {
  const activePlayer = PieceColor.toString(game.activePlayer);
  return `${activePlayer} is not in check but has no legal moves, therefore it is a draw.`;
};

const GameOverModal = (game) => {
  const { isCheckmate, getPgn } = game;
  const title = isCheckmate ? 'Checkmate' : 'Stalemate';
  const message = isCheckmate ? getCheckmateMessage(game) : getStalemateMessage(game);
  const moves = getPgn();
  return (
    <div className="modal micromodal-slide" id="game-over-modal" aria-hidden="true">
      <div className="modal__overlay" tabIndex="-1" data-micromodal-close>
        <div className="modal__container" role="dialog" aria-modal="true" aria-labelledby="game-over-modal-title">
          <header className="modal__header">
            <h2 className="modal__title">{title}</h2>
            <button type="button" className="modal__close" aria-label="Close modal" data-micromodal-close />
          </header>
          <main className="modal__content-container" id="game-over-modal-content">
            <div className="modal__content">
              <p id="game-over-modal-message">{message}</p>
              <p id="game-over-modal-moves">{moves}</p>
            </div>
            <footer id="modal-footer" className="modal__footer">
              <button type="button" className="modal__btn" data-micromodal-close aria-label="Close this dialog window">Close</button>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
