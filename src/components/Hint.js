import React from 'react';
import Modal from 'react-modal';
import { modalOverlayStyle, modalContentStyle } from '../game/utils';

const Hint = ({ hint, closeHintModal }) => (
  <Modal
    isOpen
    onRequestClose={closeHintModal}
    style={{ overlay: modalOverlayStyle, content: modalContentStyle }}
  >
    <div className="hint-modal">
      <span className="hint">{hint}</span>
    </div>
  </Modal>
);

export default Hint;
