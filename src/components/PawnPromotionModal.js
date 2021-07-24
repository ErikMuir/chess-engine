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
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    const promotionCanvas = document.getElementById(promotionCanvasId);
    promotionCanvas.onclick = this.onClick;
    this.ctx = promotionCanvas.getContext('2d');
  }

  draw = () => {
    const { board } = this.props;
    const color = board.game.activePlayer;
    const offset = proportion(0.1);
    const size = proportion(0.8);
    PieceType.promotionTypes.forEach((type, index) => {
      const x = (squareSize * index) + offset;
      const y = offset;
      const piece = new Piece(color, type);
      piece.getImage().then((img) => this.ctx.drawImage(img, x, y, size, size));
    });
  };

  onClick = (e) => {
    const { board } = this.props;
    const index = Math.floor(e.offsetX / squareSize);
    board.promotionMove.pawnPromotionType = PieceType.promotionTypes[index];
    board.doMove(board.promotionMove);
    board.promotionMove = null;
  };

  render() {
    return (
      <Modal
        isOpen
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
      >
        <CanvasContainer
          canvasId={promotionCanvasId}
          draw={this.draw}
          width={squareSize * PieceType.promotionTypes.length}
          height={squareSize}
        />
      </Modal>
    );
  }
}

export default PawnPromotionModal;
