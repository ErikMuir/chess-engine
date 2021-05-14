// ------------------------------------
// globals
// ------------------------------------
const _startPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const _directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
const _numSquaresToEdge = new Array(64);
const _lightColor = '#f1d9c0';
const _darkColor = '#a97a65';
const _activeOverlay = '#00cc00';
const _previousOverlay = '#cccc00';
const _overlayOpacity = 0.4;
const _squareSize = 80;
let _board;
let _canvas;
let _ctx;
let _whitePieces, _blackPieces;
let _prevMoveSquares = [];
let _activeSquare, _hoverSquare;
let _hoverX, _hoverY, _dragPiece;

// ------------------------------------
// page load
// ------------------------------------
window.onload = () => {
  initCanvas();
  initPieces();
  initBoard();
  initEngine();
  return setInterval(draw, 10);
}

// ------------------------------------
// initialization functions
// ------------------------------------
function initCanvas() {
  _canvas = document.getElementById('canvas');
  _canvas.width = _squareSize * 8;
  _canvas.height = _squareSize * 8;
  _canvas.onmousedown = onMouseDown;
  _canvas.onmouseup = onMouseUp;
  _canvas.onmousemove = onMouseMove;
  _canvas.onmouseout = onMouseOut;
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
  _board = new Board(_startPosition);
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

// ------------------------------------
// classes
// ------------------------------------
class Game {
  constructor() {
    this.board = new Board();
  }
}

class Board {
  constructor(board) {
    this.squares = new Array(64);
    if (board instanceof Board) {
      this.squares = board.squares.map(
        ({ file, rank, piece }) => new Square(file, rank, piece)
      );
    } else {
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          this.squares[rank * 8 + file] = new Square(file, rank);
        }
      }
      if (typeof board === 'string') {
        this.loadFen(board);
      }
    }
  }

  draw = () => {
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

  get squareColor() { return this.isLightSquare ? _lightColor : _darkColor; }
  get textColor() { return this.isLightSquare ? _darkColor : _lightColor; }
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

    if ([_activeSquare, _hoverSquare].includes(this)) {
      this.drawOverlay(_activeOverlay);
    }

    if (_prevMoveSquares.includes(this)) {
      this.drawOverlay(_previousOverlay);
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

  drawOverlay = (color) => {
    _ctx.fillStyle = color;
    _ctx.globalAlpha = _overlayOpacity;
    _ctx.fillRect(this.xPos, this.yPos, _squareSize, _squareSize);
    _ctx.globalAlpha = 1.0;
  }

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
// helper functions
// ------------------------------------
const proportion = (ratio) => Math.floor(_squareSize * ratio);

const isDigit = (str) => /^\d+$/.test(str);

// ------------------------------------
// move functions
// ------------------------------------
function onMouseDown(e) {
  const square = getEventSquare(e);
  if (square === _activeSquare) {
    clearActiveSquares()
  } else if (square.piece) {
    initDrag(square);
    initMove(square);
    setHover(e);
  }
}

function onMouseUp(e) {
  if (!_activeSquare) return;
  const square = getEventSquare(e);
  if (_activeSquare !== square) {
    doMove(square);
  }
  if (_dragPiece) {
    cancelDrag();
  }
}

function onMouseMove(e) {
  setHover(e);
}

function onMouseOut() {
  _hoverSquare = null;
  if (_dragPiece) {
    cancelDrag();
    _activeSquare = null;
  }
}

function setHover(e) {
  _hoverX = e.offsetX;
  _hoverY = e.offsetY;
  _hoverSquare = _activeSquare ? getEventSquare(e) : null;
}

function initDrag(fromSquare) {
  _dragPiece = fromSquare.piece;
}

function cancelDrag() {
  if (_activeSquare) {
    _activeSquare.piece = _dragPiece;
  }
  _dragPiece = null;
}

function initMove(fromSquare) {
  fromSquare.piece = 0;
  _activeSquare = fromSquare;
}

function doMove(toSquare) {
  _prevMoveSquares = [_activeSquare, toSquare];
  toSquare.piece = _dragPiece || _activeSquare.piece;
  _activeSquare.piece = 0;
  clearActiveSquares()
}

function clearActiveSquares() {
  _activeSquare = null;
  _hoverSquare = null;
}

function getEventSquare(e) {
  const rank = 7 - Math.floor(e.offsetY / _squareSize);
  const file = Math.floor(e.offsetX / _squareSize);
  return _board.squares[rank * 8 + file];
}

// ------------------------------------
// draw functions
// ------------------------------------
function draw() {
  _board.draw();
  if (_dragPiece) {
    drawDragPiece();
  }
}

function drawDragPiece() {
  const img = getPieceImage(_dragPiece);
  const size = proportion(0.8);
  const x = _hoverX - (size / 2);
  const y = _hoverY - (size / 2);
  _ctx.drawImage(img, x, y, size, size);
}

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

// BUGS:
/*
Steps: click on a piece, click it again
Expected Behavior: it should deselect the square as active
Actual Behavior: it removes the piece and square remains active
*/
