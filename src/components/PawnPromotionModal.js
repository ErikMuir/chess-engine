import React from 'react';
import Modal from 'react-modal';
import CanvasContainer from './CanvasContainer';
import Piece from '../game/Piece';
import PieceType from '../game/PieceType';
import { squareSize } from '../game/constants';
import { proportion } from '../game/utils';

const promotionCanvasId = 'pawn-promotion-canvas';

class PawnPromotionModal extends React.Component {
  constructor(props) {
    super(props);
    this.ctx = null;
    this.draw = this.draw.bind(this);
    this.onAfterOpen = this.onAfterOpen.bind(this);
  }

  onAfterOpen = () => {
    const { onClick } = this.props;
    const promotionCanvas = document.getElementById(promotionCanvasId);
    promotionCanvas.onclick = onClick;
    this.ctx = promotionCanvas.getContext('2d');
  };

  draw = () => {
    if (!this.ctx) return;
    const { activePlayer } = this.props;
    const color = activePlayer;
    const offset = proportion(0.1);
    const size = proportion(0.8);
    PieceType.promotionTypes.forEach((type, index) => {
      const x = squareSize * index;
      const y = offset;
      const piece = new Piece(color, type);
      piece.getImage().then((img) => this.ctx.drawImage(img, x, y, size, size * 2));
    });
  };

  getOverlayStyle = () => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
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
    marginTop: `${squareSize * 4}px`,
    marginLeft: 'auto',
    marginRight: 'auto',
    border: 'none',
    outline: 'none',
  });

  render() {
    const height = squareSize;
    const width = squareSize * PieceType.promotionTypes.length;
    const overlay = this.getOverlayStyle();
    const content = this.getContentStyle(width, height);
    const style = { overlay, content };
    return (
      <Modal
        isOpen
        onAfterOpen={this.onAfterOpen}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        style={style}
      >
        <CanvasContainer
          canvasId={promotionCanvasId}
          draw={this.draw}
          width={width}
          height={height}
        />
      </Modal>
    );
  }
}

export default PawnPromotionModal;
