import React from 'react';
import Modal from 'react-modal';
import Piece from '../engine/Piece';
import { promotionTypes } from '../engine/PieceTypes';
import { modalContentStyle, modalOverlayStyle } from '../engine/utils';

const canvasId = 'promotion-canvas';
const pieceSize = 80;
const proportion = (ratio) => Math.floor(pieceSize * ratio);

const PawnPromotion = ({ onClick, activePlayer }) => {
  const onAfterOpen = () => {
    const canvas = document.getElementById(canvasId);
    canvas.onclick = onClick;
    const ctx = canvas.getContext('2d');
    const offset = proportion(0.1);
    const size = proportion(0.8);
    promotionTypes.forEach((type, index) => {
      const x = pieceSize * index;
      const y = offset;
      const piece = new Piece(activePlayer, type);
      piece.getImage().then((img) => ctx.drawImage(img, x, y, size, size * 2));
    });
  };

  const height = pieceSize;
  const width = pieceSize * promotionTypes.length;
  const overlay = modalOverlayStyle;
  const content = {
    ...modalContentStyle,
    padding: '10px 20px',
    width: `${width + 40}px`,
    height: `${height + 20}px`,
    backgroundColor: '#eeeeee',
  };
  const cursor = 'pointer';

  return (
    <Modal
      isOpen
      onAfterOpen={onAfterOpen}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      style={{ overlay, content }}
    >
      <div className="canvas-container" style={{ width, height }}>
        <canvas id={canvasId} style={{ cursor }} />
      </div>
    </Modal>
  );
};

export default PawnPromotion;
