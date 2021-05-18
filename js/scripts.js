// By en:User:Cburnett - Own work  This W3C-unspecified vector image was created with Inkscape ., CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499803

window.onload = () => {
  const game = new Game();
  game.init();
}

class Game {
  constructor() {
    this.board = null;
    this.ctx = null;
    this.whitePieces = {};
    this.blackPieces = {};
    this.startPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    this.squareSize = 80;
    this.lightColor = '#f1d9c0';
    this.darkColor = '#a97a65';
    this.activeOverlay = '#00cc00';
    this.previousOverlay = '#cccc00';
    this.overlayOpacity = 0.4;
    this.numSquaresToEdge = new Array(64);
    this.directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
    this.prevMoveSquares = [];
    this.activeSquare = null;
    this.hoverSquare = null;
    this.hoverX = null;
    this.hoverY = null;
    this.dragPiece = null;
  }

  init = () => {
    this.initCanvas();
    this.initPieces();
    this.initBoard();
    this.initEngine();
    return setInterval(this.draw, 10);
  };

  initCanvas = () => {
    const canvas = document.getElementById('canvas');
    canvas.width = this.squareSize * 8;
    canvas.height = this.squareSize * 8;
    canvas.onmousedown = this.onMouseDown;
    canvas.onmouseup = this.onMouseUp;
    canvas.onmousemove = this.onMouseMove;
    canvas.onmouseout = this.onMouseOut;
    this.ctx = canvas.getContext('2d');
  };

  initPieces = () => {
    this.whitePieces = {
      King: this.getImage('white-king.svg'),
      Pawn: this.getImage('white-pawn.svg'),
      Knight: this.getImage('white-knight.svg'),
      Bishop: this.getImage('white-bishop.svg'),
      Rook: this.getImage('white-rook.svg'),
      Queen: this.getImage('white-queen.svg'),
    };
    this.blackPieces = {
      King: this.getImage('black-king.svg'),
      Pawn: this.getImage('black-pawn.svg'),
      Knight: this.getImage('black-knight.svg'),
      Bishop: this.getImage('black-bishop.svg'),
      Rook: this.getImage('black-rook.svg'),
      Queen: this.getImage('black-queen.svg'),
    };
  };

  initBoard = () => {
    this.board = new Board(this);
  };

  initEngine = () => {
    for (let file = 0; file < 8; file++) {
      for (let rank = 0; rank < 8; rank++) {
        const numNorth = 7 - rank;
        const numSouth = rank;
        const numWest = file;
        const numEast = 7 - file;

        const squareIndex = rank * 8 + file;

        this.numSquaresToEdge[squareIndex] = [
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
  };

  onMouseDown = (e) => {
    const square = this.getEventSquare(e);
    if (square === this.activeSquare) {
      this.clearActiveSquares()
    } else if (square.piece) {
      this.initDrag(square);
      this.initMove(square);
      this.setHover(e);
    }
  };

  onMouseUp = (e) => {
    if (!this.activeSquare) return;
    const square = this.getEventSquare(e);
    if (this.activeSquare !== square) {
      this.doMove(square);
    }
    if (this.dragPiece) {
      this.cancelDrag();
    }
  };

  onMouseMove = (e) => {
    this.setHover(e);
  };

  onMouseOut = () => {
    this.hoverSquare = null;
    if (this.dragPiece) {
      this.cancelDrag();
      this.activeSquare = null;
    }
  };

  setHover = (e) => {
    this.hoverX = e.offsetX;
    this.hoverY = e.offsetY;
    this.hoverSquare = this.activeSquare ? this.getEventSquare(e) : null;
  }

  initDrag = (fromSquare) => {
    this.dragPiece = fromSquare.piece;
  }

  cancelDrag = () => {
    if (this.activeSquare) {
      this.activeSquare.piece = this.dragPiece;
    }
    this.dragPiece = null;
  }

  initMove = (fromSquare) => {
    fromSquare.piece = 0;
    this.activeSquare = fromSquare;
  }

  doMove = (toSquare) => {
    this.prevMoveSquares = [this.activeSquare, toSquare];
    toSquare.piece = this.dragPiece || this.activeSquare.piece;
    this.activeSquare.piece = 0;
    this.clearActiveSquares()
  }

  clearActiveSquares = () => {
    this.activeSquare = null;
    this.hoverSquare = null;
  }

  getEventSquare = (e) => {
    const rank = 7 - Math.floor(e.offsetY / this.squareSize);
    const file = Math.floor(e.offsetX / this.squareSize);
    return this.board.squares[rank * 8 + file];
  }

  proportion = (ratio) => Math.floor(this.squareSize * ratio);

  draw = () => {
    this.board.draw();
    if (this.dragPiece) {
      this.drawDragPiece();
    }
  }

  drawDragPiece = () => {
    const img = this.getPieceImage(this.dragPiece);
    const size = this.proportion(0.8);
    const x = this.hoverX - (size / 2);
    const y = this.hoverY - (size / 2);
    this.ctx.drawImage(img, x, y, size, size);
  }

  getPieceImage = (piece) => {
    if (!piece) return null;
    const set = piece < 16 ? this.whitePieces : this.blackPieces;
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

  getImage = (fileName) => {
    var img = new Image();
    img.src = `./images/${fileName}`;
    return img;
  };
}

class Board {
  constructor(game) {
    this.game = game;
    this.squares = new Array(64);
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        this.squares[rank * 8 + file] = new Square(file, rank, game);
      }
    }
    this.loadFen(game.startPosition);
  }

  draw = () => {
    this.squares.forEach(sq => sq.draw());
  };

  isDigit = (str) => /^\d+$/.test(str);

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
      } else if (this.isDigit(symbol)) {
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
  constructor(file, rank, game) {
    this.file = file;
    this.rank = rank;
    this.game = game;
    this.piece = 0;
    this.isLightSquare = (file + rank) % 2 === 0;
  }

  get squareColor() { return this.isLightSquare ? this.game.lightColor : this.game.darkColor; }
  get textColor() { return this.isLightSquare ? this.game.darkColor : this.game.lightColor; }
  get xPos() { return this.file * this.game.squareSize; }
  get yPos() { return (this.game.squareSize * 7) - (this.rank * this.game.squareSize); }

  draw = () => {
    this.game.ctx.fillStyle = this.squareColor;
    this.game.ctx.fillRect(this.xPos, this.yPos, this.game.squareSize, this.game.squareSize);

    if (this.file === 0) {
      this.drawRankLabel();
    }

    if (this.rank === 0) {
      this.drawFileLabel();
    }

    if ([this.game.activeSquare, this.game.hoverSquare].includes(this)) {
      this.drawOverlay(this.game.activeOverlay);
    }

    if (this.game.prevMoveSquares.includes(this)) {
      this.drawOverlay(this.game.previousOverlay);
    }

    if (this.piece) {
      this.drawPiece();
    }
  };

  drawRankLabel = () => {
    const rankText = `${this.rank + 1}`;
    const x = this.xPos + this.game.proportion(0.05);
    const y = this.yPos + this.game.proportion(0.2);
    this.game.ctx.fillStyle = this.textColor;
    this.game.ctx.font = `400 ${this.game.proportion(0.175)}px sans-serif`;
    this.game.ctx.fillText(rankText, x, y);
  };

  drawFileLabel = () => {
    const fileText = 'abcdefgh'[this.file];
    const x = this.xPos + this.game.squareSize - this.game.proportion(0.15);
    const y = this.yPos + this.game.squareSize - this.game.proportion(0.075);
    this.game.ctx.fillStyle = this.textColor;
    this.game.ctx.font = `400 ${this.game.proportion(0.175)}px sans-serif`;
    this.game.ctx.fillText(fileText, x, y);
  };

  drawOverlay = (color) => {
    this.game.ctx.fillStyle = color;
    this.game.ctx.globalAlpha = this.game.overlayOpacity;
    this.game.ctx.fillRect(this.xPos, this.yPos, this.game.squareSize, this.game.squareSize);
    this.game.ctx.globalAlpha = 1.0;
  }

  drawPiece = () => {
    const img = this.game.getPieceImage(this.piece);
    const offset = this.game.proportion(0.1);
    const size = this.game.proportion(0.8);
    const x = this.xPos + offset;
    const y = this.yPos + offset;
    this.game.ctx.drawImage(img, x, y, size, size);
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
