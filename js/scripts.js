const _lightCol = '#f1d9c0';
const _darkCol = '#a97a65';
const _squareSize = 80;
let _board;
let _ctx;
let _blackPieces;
let _whitePieces;

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
  get img() {
    if (!this.piece) return null;
    const set = this.piece < 16 ? _whitePieces : _blackPieces;
    let piece = this.piece;
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

  draw = () => {
    _ctx.fillStyle = this.squareColor;
    _ctx.fillRect(this.xPos, this.yPos, _squareSize, _squareSize);

    if (this.file === 0) {
      this.drawRankLabel();
    }

    if (this.rank === 0) {
      this.drawFileLabel();
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
    const offset = proportion(0.1);
    const size = proportion(0.8);
    const x = this.xPos + offset;
    const y = this.yPos + offset;
    _ctx.drawImage(this.img, x, y, size, size);
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

const proportion = (ratio) => Math.floor(_squareSize * ratio);

const isDigit = (str) => /^\d+$/.test(str);

function onLoad() {
  _blackPieces = {
    Queen: document.getElementById('black-queen'),
    King: document.getElementById('black-king'),
    Rook: document.getElementById('black-rook'),
    Knight: document.getElementById('black-knight'),
    Bishop: document.getElementById('black-bishop'),
    Pawn: document.getElementById('black-pawn'),
  };
  _whitePieces = {
    Queen: document.getElementById('white-queen'),
    King: document.getElementById('white-king'),
    Rook: document.getElementById('white-rook'),
    Knight: document.getElementById('white-knight'),
    Bishop: document.getElementById('white-bishop'),
    Pawn: document.getElementById('white-pawn'),
  };
  const canvas = document.getElementById('canvas');
  canvas.width = _squareSize * 8;
  canvas.height = _squareSize * 8;
  _ctx = canvas.getContext('2d');
  _board = new Board();
  const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  _board.loadFen(fen);
  _board.draw();
}
