import React from 'react';
import Modal from 'react-modal';
import { modalOverlayStyle, modalContentStyle } from '../engine/utils';

const Information = ({ closeInformationModal }) => (
  <Modal
    isOpen
    onRequestClose={closeInformationModal}
    style={{ overlay: modalOverlayStyle, content: modalContentStyle }}
  >
    <header className="modal__header">
      <h2 className="modal__title">Information</h2>
      <button
        type="button"
        className="modal__close"
        aria-label="Close modal"
        onClick={closeInformationModal}
      />
    </header>
    <main className="modal__content-container">
      <div className="modal__content">
        <p>
          This is a side project and is still a work in progress.
          Send bug reports and feature requests to:
          {' '}
          <a href="mailto:erik@muirdev.com">erik@muirdev.com</a>
          .
        </p>
        <p className="align-right">- Erik Muir (developer)</p>
      </div>
    </main>
  </Modal>
);

export default Information;
