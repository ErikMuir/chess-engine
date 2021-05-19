let _game;

window.onload = () => {
  _game = new Game();
  _game.init();
}

class Utils {
  static isDigit = (str) => /^\d+$/.test(str);

  static getImage = (filename) => {
    var img = new Image();
    img.src = `./images/${filename}`;
    return img;
  };
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
    this.possibleOverlay = '#cc0000';
    this.overlayOpacity = 0.4;
    this.numSquaresToEdge = new Array(64);
    this.directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
    this.prevMoveSquares = [];
    this.possibleSquares = [];
    this.activeSquare = null;
    this.hoverSquare = null;
    this.hoverX = null;
    this.hoverY = null;
    this.dragPiece = null;
    this.colorToMove = PieceColor.White;
    this.possibleMoves = [];
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
      King: Utils.getImage('white-king.svg'),
      Pawn: Utils.getImage('white-pawn.svg'),
      Knight: Utils.getImage('white-knight.svg'),
      Bishop: Utils.getImage('white-bishop.svg'),
      Rook: Utils.getImage('white-rook.svg'),
      Queen: Utils.getImage('white-queen.svg'),
    };
    this.blackPieces = {
      King: Utils.getImage('black-king.svg'),
      Pawn: Utils.getImage('black-pawn.svg'),
      Knight: Utils.getImage('black-knight.svg'),
      Bishop: Utils.getImage('black-bishop.svg'),
      Rook: Utils.getImage('black-rook.svg'),
      Queen: Utils.getImage('black-queen.svg'),
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
    this.generateMoves();
  };

  onMouseDown = (e) => {
    const square = this.getEventSquare(e);
    if (square === this.activeSquare) {
      this.clearActiveSquares();
      this.clearPossibleSquares();
    } else if (square.piece && square.piece.color === this.colorToMove) {
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
      this.clearPossibleSquares();
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
    fromSquare.piece = null;
    this.activeSquare = fromSquare;
    this.possibleSquares = this.possibleMoves
      .filter(move => move.fromIndex === fromSquare.index)
      .map(move => move.toIndex);
  }

  doMove = (toSquare) => {
    this.prevMoveSquares = [this.activeSquare, toSquare];
    toSquare.piece = this.dragPiece || this.activeSquare.piece;
    this.activeSquare.piece = null;
    this.clearActiveSquares();
    this.colorToMove = this.colorToMove === PieceColor.White ? PieceColor.Black : PieceColor.White;
    this.generateMoves();
  }

  clearActiveSquares = () => {
    this.activeSquare = null;
    this.hoverSquare = null;
  }

  clearPossibleSquares = () => {
    this.possibleSquares = [];
  };

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
    let set;
    switch (piece.color) {
      case PieceColor.White:
        set = this.whitePieces;
        break;
      case PieceColor.Black:
        set = this.blackPieces;
        break;
    }
    switch (piece.type) {
      case PieceType.King: return set.King;
      case PieceType.Pawn: return set.Pawn;
      case PieceType.Knight: return set.Knight;
      case PieceType.Bishop: return set.Bishop;
      case PieceType.Rook: return set.Rook;
      case PieceType.Queen: return set.Queen;
      default: return null;
    }
  }

  generateMoves = () => {
    this.possibleMoves = [];
    for (let fromIndex = 0; fromIndex < 64; fromIndex++) {
      const piece = this.board.squares[fromIndex].piece;
      if (!piece || piece.color !== this.colorToMove) continue;
      if (piece.isSlidingPiece()) {
        this.generateSlidingMoves(fromIndex, piece);
      }
      // todo : else if () ...
    }
  };

  generateSlidingMoves = (fromIndex, piece) => {
    const startDirIndex = piece.type === PieceType.Bishop ? 4 : 0;
    const endDirIndex = piece.type === PieceType.Rook ? 4 : 8;

    for (let dirIndex = startDirIndex; dirIndex < endDirIndex; dirIndex++) {
      for (let n = 0; n < this.numSquaresToEdge[fromIndex][dirIndex]; n++) {
        var toIndex = fromIndex + this.directionOffsets[dirIndex] * (n + 1);
        var toSquarePiece = this.board.squares[toIndex].piece;

        // blocked by friendly piece, so can't move any further in this direction
        if (toSquarePiece && toSquarePiece.color === this.colorToMove) break;

        this.possibleMoves.push(new Move(fromIndex, toIndex));

        // can't move any further in this direction after capturing opponent's piece
        if (toSquarePiece && toSquarePiece.color !== colorToMove) break;
      }
    }
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

  draw = () => { this.squares.forEach(sq => sq.draw()); };

  loadFen = (fen) => {
    const pieceTypeFromSymbol = {
      k: PieceType.King,
      p: PieceType.Pawn,
      n: PieceType.Knight,
      b: PieceType.Bishop,
      r: PieceType.Rook,
      q: PieceType.Queen,
    };
    const fenBoard = fen.split(' ')[0];
    let file = 0, rank = 7;
    fenBoard.split('').forEach(symbol => {
      if (symbol === '/') {
        file = 0;
        rank--;
      } else if (Utils.isDigit(symbol)) {
        file += parseInt(symbol);
      } else {
        const pieceColor = symbol === symbol.toUpperCase() ? PieceColor.White : PieceColor.Black;
        const pieceType = pieceTypeFromSymbol[symbol.toLowerCase()];
        this.squares[rank * 8 + file].piece = new Piece(pieceColor, pieceType);
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
    this.piece = null;
    this.index = rank * 8 + file;
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

    if (this.game.possibleSquares.includes(this.index)) {
      this.drawOverlay(this.game.possibleOverlay);
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

class PieceColor {
  static White = 8;
  static Black = 16;
}

class PieceType {
  static None = 0;
  static King = 1;
  static Pawn = 2;
  static Knight = 3;
  static Bishop = 4;
  static Rook = 5;
  static Queen = 6;
}

class Piece {
  constructor(color, type) {
    this.color = color;
    this.type = type;
    this.value = color | type;
  }

  isSlidingPiece = () => {
    const slidingPieces = [PieceType.Bishop, PieceType.Rook, PieceType.Queen]
    return slidingPieces.includes(this.type);
  }
}

class Move {
  constructor(fromIndex, toIndex) {
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
  }
}
