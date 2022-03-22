import React from 'react';
import Modal from 'react-modal';
import { modalOverlayStyle, modalContentStyle } from '../engine/utils';

const ConfirmModal = ({
  title = 'Confirmation',
  displayText = 'Are you sure?',
  confirm,
  cancel,
}) => (
  <Modal
    isOpen
    onRequestClose={cancel}
    style={{ overlay: modalOverlayStyle, content: modalContentStyle }}
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

export default ConfirmModal;
