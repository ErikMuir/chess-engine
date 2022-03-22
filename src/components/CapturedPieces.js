import React, { useEffect, useState } from 'react';
import Piece from '../engine/Piece';
import { pieceTypeFromPieceId } from '../engine/PieceTypes';
import { clearCanvas } from '../utils';

const blackCanvasId = 'captured-black-pieces-canvas';
const whiteCanvasId = 'captured-white-pieces-canvas';
const pieceSize = 20;

const ascending = (a, b) => {
  const aType = pieceTypeFromPieceId(a);
  const bType = pieceTypeFromPieceId(b);
  const diff = aType.value - bType.value;
  return diff === 0 ? aType.id - bType.id : diff;
};

const descending = (a, b) => {
  const aType = pieceTypeFromPieceId(a);
  const bType = pieceTypeFromPieceId(b);
  const diff = bType.value - aType.value;
  return diff === 0 ? bType.id - aType.id : diff;
};

const resizeCanvas = (canvasId, pieces) => {
  const canvas = document.getElementById(canvasId);
  canvas.height = pieceSize;
  canvas.width = pieceSize * pieces.length;
};

const drawPieces = (pieces, ctx, canvasId) => {
  clearCanvas(ctx);
  resizeCanvas(canvasId, pieces);
  pieces.forEach((pieceId, index) => {
    Piece
      .fromPieceId(pieceId)
      .getImage()
      .then((img) => ctx.drawImage(img, pieceSize * index, 0, pieceSize, pieceSize));
  });
};

const getCanvas = (canvasId, pieces) => {
  let styles = 'canvas-container';
  if (pieces.length) styles += ' captured-pieces';
  const width = pieceSize * pieces.length;
  return (
    <div className={styles} style={{ height: pieceSize, width }}>
      <canvas id={canvasId} />
    </div>
  );
};

const CapturedPieces = ({ blackPieces, whitePieces }) => {
  const [blackCtx, setBlackCtx] = useState(null);
  const [whiteCtx, setWhiteCtx] = useState(null);

  const draw = () => {
    if (!blackCtx || !whiteCtx) return;
    drawPieces(blackPieces.sort(ascending), blackCtx, blackCanvasId);
    drawPieces(whitePieces.sort(descending), whiteCtx, whiteCanvasId);
  };

  useEffect(() => {
    const blackWidth = pieceSize * blackPieces.length;
    const whiteWidth = pieceSize * whitePieces.length;
    const blackCanvas = document.getElementById(blackCanvasId);
    const whiteCanvas = document.getElementById(whiteCanvasId);
    blackCanvas.height = pieceSize;
    blackCanvas.width = blackWidth;
    whiteCanvas.height = pieceSize;
    whiteCanvas.width = whiteWidth;
    setBlackCtx(blackCanvas.getContext('2d'));
    setWhiteCtx(whiteCanvas.getContext('2d'));
  }, []);

  useEffect(draw, [blackPieces, whitePieces]);

  return (
    <div className="captured-pieces-container" style={{ height: pieceSize }}>
      {getCanvas(blackCanvasId, blackPieces)}
      {getCanvas(whiteCanvasId, whitePieces)}
    </div>
  );
};

export default CapturedPieces;
