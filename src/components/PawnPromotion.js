import React from 'react';
import Modal from 'react-modal';
import Piece from '../game/Piece';
import PieceType from '../game/PieceType';
import Logger from '../Logger';

const logger = new Logger('PawnPromotion');
const canvasId = 'promotion-canvas';
const pieceSize = 80;
const proportion = (ratio) => Math.floor(pieceSize * ratio);

class PawnPromotion extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor');
    this.onAfterOpen = this.onAfterOpen.bind(this);
  }

  onAfterOpen = () => {
    logger.trace('onAfterOpen');
    const { onClick, activePlayer } = this.props;
    const canvas = document.getElementById(canvasId);
    canvas.onclick = onClick;
    const ctx = canvas.getContext('2d');
    const offset = proportion(0.1);
    const size = proportion(0.8);
    PieceType.promotionTypes.forEach((type, index) => {
      const x = pieceSize * index;
      const y = offset;
      const piece = new Piece(activePlayer, type);
      piece.getImage().then((img) => ctx.drawImage(img, x, y, size, size * 2));
    });
  };

  getOverlayStyle = () => ({
    position: 'fixed',
    top: 0,
    left: -1000,
    right: -1000,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  });

  getContentStyle = (width, height) => ({
    backgroundColor: '#eeeeee',
    padding: '10px 20px',
    width: `${width + 40}px`,
    height: `${height + 20}px`,
    borderRadius: '4px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    position: 'relative',
    inset: 0,
    marginTop: `${pieceSize * 4}px`,
    marginLeft: 'auto',
    marginRight: 'auto',
    border: 'none',
    outline: 'none',
  });

  render() {
    logger.trace('render');
    const height = pieceSize;
    const width = pieceSize * PieceType.promotionTypes.length;
    const overlay = this.getOverlayStyle();
    const content = this.getContentStyle(width, height);
    const cursor = 'pointer';
    return (
      <Modal
        isOpen
        onAfterOpen={this.onAfterOpen}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        style={{ overlay, content }}
      >
        <div className="canvas-container" style={{ width, height }}>
          <canvas id={canvasId} style={{ cursor }} />
        </div>
      </Modal>
    );
  }
}

export default PawnPromotion;
