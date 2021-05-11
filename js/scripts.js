// ------------------------------------
// globals
// ------------------------------------
window.onload = onLoad;
let _lightCol = '#f1d9c0';
let _darkCol = '#a97a65';
let _overlayColor = '#ffff00';
let _squareSize = 80;
let _board;
let _canvas;
let _ctx;
let _whitePieces, _blackPieces;
let _fromSquare, _toSquare;
let _dragX, _dragY, _dragPiece;
let _directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
let _numSquaresToEdge;

// ------------------------------------
// classes
// ------------------------------------
class Board {
  constructor(copyBoard) {
    this.squares = [];
    if (copyBoard) {
      this.squares = copyBoard.squares.map(
        ({ file, rank, piece }) => new Square(file, rank, piece)
      );
    } else {
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          this.squares.push(new Square(file, rank));
        }
      }
    }
  }

  draw = () => {
    // _ctx.clearRect(0, 0, _squareSize * 8, _squareSize * 8);
    this.squares.forEach(sq => sq.draw());
  };

  loadFen = (fen) => {
    const pieceTypeFromSymbol = {
      k: Piece.King,
      p: Piece.Pawn,
      n: Piece.Knight,
      b: Piece.Bishop,
      r: Piece.Rook,
      q: Piece.Queen,
    };
    const fenBoard = fen.split(' ')[0];
    let file = 0, rank = 7;
    fenBoard.split('').forEach(symbol => {
      if (symbol === '/') {
        file = 0;
        rank--;
      } else if (isDigit(symbol)) {
        file += parseInt(symbol);
      } else {
        const pieceColor = symbol === symbol.toUpperCase() ? Piece.White : Piece.Black;
        const pieceType = pieceTypeFromSymbol[symbol.toLowerCase()];
        this.squares[rank * 8 + file].piece = pieceColor | pieceType;
        file++;
      }
    });
  };
}

class Square {
  constructor(file, rank, piece) {
    this.file = file;
    this.rank = rank;
    this.piece = piece || 0;
    this.isLightSquare = (file + rank) % 2 === 0;
  }

  get squareColor() { return this.isLightSquare ? _lightCol : _darkCol; }
  get textColor() { return this.isLightSquare ? _darkCol : _lightCol; }
  get xPos() { return this.file * _squareSize; }
  get yPos() { return (_squareSize * 7) - (this.rank * _squareSize); }

  draw = () => {
    _ctx.fillStyle = this.squareColor;
    _ctx.fillRect(this.xPos, this.yPos, _squareSize, _squareSize);

    if (this.file === 0) {
      this.drawRankLabel();
    }

    if (this.rank === 0) {
      this.drawFileLabel();
    }

    if (this === _fromSquare || this === _toSquare) {
      addOverlay(this);
    }

    if (this.piece) {
      this.drawPiece();
    }
  };

  drawRankLabel = () => {
    const rankText = `${this.rank + 1}`;
    const x = this.xPos + proportion(0.05);
    const y = this.yPos + proportion(0.2);
    _ctx.fillStyle = this.textColor;
    _ctx.font = `400 ${proportion(0.175)}px sans-serif`;
    _ctx.fillText(rankText, x, y);
  };

  drawFileLabel = () => {
    const fileText = 'abcdefgh'[this.file];
    const x = this.xPos + _squareSize - proportion(0.15);
    const y = this.yPos + _squareSize - proportion(0.075);
    _ctx.fillStyle = this.textColor;
    _ctx.font = `400 ${proportion(0.175)}px sans-serif`;
    _ctx.fillText(fileText, x, y);
  };

  drawPiece = () => {
    const img = getPieceImage(this.piece);
    const offset = proportion(0.1);
    const size = proportion(0.8);
    const x = this.xPos + offset;
    const y = this.yPos + offset;
    _ctx.drawImage(img, x, y, size, size);
  };
}

class Piece {
  static None = 0;
  static King = 1;
  static Pawn = 2;
  static Knight = 3;
  static Bishop = 4;
  static Rook = 5;
  static Queen = 6;

  static White = 8;
  static Black = 16;
}

// ------------------------------------
// helpers
// ------------------------------------
const proportion = (ratio) => Math.floor(_squareSize * ratio);

const isDigit = (str) => /^\d+$/.test(str);

const getPieceImage = (piece) => {
  if (!piece) return null;
  const set = piece < 16 ? _whitePieces : _blackPieces;
  while (piece >= 8) {
    piece -= 8;
  }
  switch (piece) {
    case Piece.King: return set.King;
    case Piece.Pawn: return set.Pawn;
    case Piece.Knight: return set.Knight;
    case Piece.Bishop: return set.Bishop;
    case Piece.Rook: return set.Rook;
    case Piece.Queen: return set.Queen;
    default: return null;
  }
}

// ------------------------------------
// handlers
// ------------------------------------
function onMouseDown(e) {
  _fromSquare = null;
  _toSquare = null;
  const square = getEventSquare(e);
  if (square.piece) {
    _dragPiece = square.piece;
    _dragX = e.offsetX;
    _dragY = e.offsetY;
    square.piece = 0;
    _fromSquare = square;
    _canvas.onmousemove = onMouseMove;
  }
}

function onMouseMove(e) {
  if (_dragPiece) { // should never be false, right?
    _dragX = e.offsetX;
    _dragY = e.offsetY;
  }
}

function onMouseUp(e) {
  if (!_fromSquare) return;
  _toSquare = getEventSquare(e);
  doMove();
  _dragPiece = null;
  _dragX = null;
  _dragY = null;
  _canvas.onmousemove = null;
}

// ------------------------------------
// functions
// ------------------------------------
function initCanvas() {
  _canvas = document.getElementById('canvas');
  _canvas.width = _squareSize * 8;
  _canvas.height = _squareSize * 8;
  _canvas.onmousedown = onMouseDown;
  _canvas.onmouseup = onMouseUp;
  _ctx = canvas.getContext('2d');
}

function initPieces() {
  _whitePieces = {
    King: document.getElementById('white-king'),
    Pawn: document.getElementById('white-pawn'),
    Knight: document.getElementById('white-knight'),
    Bishop: document.getElementById('white-bishop'),
    Rook: document.getElementById('white-rook'),
    Queen: document.getElementById('white-queen'),
  };
  _blackPieces = {
    King: document.getElementById('black-king'),
    Pawn: document.getElementById('black-pawn'),
    Knight: document.getElementById('black-knight'),
    Bishop: document.getElementById('black-bishop'),
    Rook: document.getElementById('black-rook'),
    Queen: document.getElementById('black-queen'),
  };
}

function initBoard() {
  const startPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  _board = new Board();
  _board.loadFen(startPosition);
}

function initEngine() {
  for (let file = 0; file < 8; file++) {
    for (let rank = 0; rank < 8; rank++) {
      const numNorth = 7 - rank;
      const numSouth = rank;
      const numWest = file;
      const numEast = 7 - file;

      const squareIndex = rank * 8 + file;

      _numSquaresToEdge[squareIndex] = [
        numNorth,
        numSouth,
        numWest,
        numEast,
        Math.min(numNorth, numWest),
        Math.min(numSouth, numEast),
        Math.min(numNorth, numEast),
        Math.min(numSouth, numWest),
      ];
    }
  }
}

function draw() {
  _board.draw();
  if (_dragPiece) {
    const dragSquare = getDragSquare();
    if (dragSquare !== _fromSquare) {
      addOverlay(dragSquare);
    }
    drawDragPiece();
  }
}

function drawDragPiece() {
  const img = getPieceImage(_dragPiece);
  const size = proportion(0.8);
  const x = _dragX - (size / 2);
  const y = _dragY - (size / 2);
  _ctx.drawImage(img, x, y, size, size);
}

function addOverlay(square) {
  _ctx.fillStyle = _overlayColor;
  _ctx.globalAlpha = 0.25;
  _ctx.fillRect(square.xPos, square.yPos, _squareSize, _squareSize);
  _ctx.globalAlpha = 1.0;
}

function getEventSquare(e) {
  const rank = 7 - Math.floor(e.offsetY / _squareSize);
  const file = Math.floor(e.offsetX / _squareSize);
  return _board.squares[rank * 8 + file];
}

function getDragSquare() {
  const rank = 7 - Math.floor(_dragY / _squareSize);
  const file = Math.floor(_dragX / _squareSize);
  return _board.squares[rank * 8 + file];
}

function doMove() {
  if (_fromSquare === _toSquare) {
    _fromSquare.piece = _dragPiece;
  } else {
    _toSquare.piece = _dragPiece;
    _fromSquare.piece = 0;
  }
}

// ------------------------------------
// on page load
// ------------------------------------
function onLoad() {
  initCanvas();
  initPieces();
  initBoard();
  initEngine();
  return setInterval(draw, 10);
}
