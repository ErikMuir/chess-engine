import React from 'react';
import { useRecoilValue } from 'recoil';
import Modal from 'react-modal';
import { hintState } from '../state';
import { modalOverlayStyle, modalContentStyle } from '../engine';

const Hint = ({ closeHintModal }) => {
  const hint = useRecoilValue(hintState);
  return (
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
};

export default Hint;
