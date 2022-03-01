import React from 'react';
import Modal from 'react-modal';
import { modalOverlayStyle, modalContentStyle } from '../game/utils';

const Welcome = ({ closeWelcomeModal }) => (
  <Modal
    isOpen
    onRequestClose={closeWelcomeModal}
    style={{ overlay: modalOverlayStyle, content: modalContentStyle }}
  >
    <header className="modal__header">
      <h2 className="modal__title">Welcome to Chess!</h2>
      <button
        type="button"
        className="modal__close"
        aria-label="Close modal"
        onClick={closeWelcomeModal}
      />
    </header>
    <main className="modal__content-container">
      <div className="modal__content">
        <p>
          This is one of my side projects, and is still a work in progress.
          It does not work on mobile devices currently.
        </p>
        <p>
          Send bug reports and feature requests to
          {' '}
          <a href="mailto:erik@muirdev.com">erik@muirdev.com</a>
          .
        </p>
        <p className="align-right">- Erik Muir (developer)</p>
      </div>
    </main>
  </Modal>
);

export default Welcome;
