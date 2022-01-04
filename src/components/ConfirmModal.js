import React from 'react';
import Modal from 'react-modal';
import { squareSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('GameOver');

const getOverlayStyle = () => ({
  position: 'fixed',
  top: 0,
  left: -1000,
  right: -1000,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  // display: 'flex',
  // justifyContent: 'center',
  // alignItems: 'center',
  // zIndex: 10,
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

const ConfirmModal = ({
  title = 'Confirmation',
  displayText = 'Are you sure?',
  confirm,
  cancel,
}) => {
  logger.trace('render');
  const overlay = getOverlayStyle();
  const content = getContentStyle();
  return (
    <Modal
      isOpen
      onRequestClose={cancel}
      style={{ overlay, content }}
    >
      <header className="modal__header">
        <h2 className="modal__title">{title}</h2>
        <button
          type="button"
          className="modal__close"
          aria-label="Close"
          onClick={cancel}
        />
      </header>
      <main className="modal__content-container">
        <div className="modal__content">{displayText}</div>
        <footer className="modal__footer">
          <button
            type="button"
            className="modal__btn modal__btn-destroy"
            aria-label="Confirm"
            onClick={confirm}
          >
            Confirm
          </button>
          <button
            type="button"
            className="modal__btn"
            aria-label="Cancel"
            onClick={cancel}
          >
            Cancel
          </button>
        </footer>
      </main>
    </Modal>
  );
};

export default ConfirmModal;
