import React from 'react';
import { squareSize } from '../game/constants';
import PieceType from '../game/PieceType';
import Piece from '../game/Piece';
import { getPieceImage } from '../game/helpers';
import { proportion } from '../game/utils';

const promotionTypes = [
  PieceType.queen,
  PieceType.rook,
  PieceType.bishop,
  PieceType.knight,
];

class PawnPromotionModal extends React.Component {
  componentDidMount() {
    const { color } = this.props;
    const offset = proportion(0.1);
    const size = proportion(0.8);
    promotionTypes.forEach((type, index) => {
      const piece = new Piece(color, type);
      const img = getPieceImage(piece);
      const x = (squareSize * index) + offset;
      const y = offset;
      this.ppCtx.drawImage(img, x, y, size, size);
    });
  }

  render() {
    return (
      <div className="modal micromodal-slide" id="pawn-promotion-modal" aria-hidden="true">
        <div className="modal__overlay" tabIndex="-1" data-micromodal-close>
          <main id="pawn-promotion-modal-content" role="dialog" aria-modal="true">
            <canvas id="pawn-promotion-canvas" />
          </main>
        </div>
      </div>
    );
  }
}

export default PawnPromotionModal;
