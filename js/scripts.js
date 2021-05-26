let _game;

window.onload = () => {
  _game = new Game();
  _game.init();
}

/**
 * FEATURES
 * ------------------------------------
 *  legal moves (test for check)
 *  signal checkmate
 *  pawn promotion non-queen options
 *  determine best move
 * 
 * BUGS
 * ------------------------------------
 */

class Utils {
  static isDigit = (str) => /^\d+$/.test(str);

  static getImage = (filename) => {
    var img = new Image();
    img.src = `./images/${filename}`;
    return img;
  };
}

class PieceColor {
  static None = 0;
  static White = 8;
  static Black = 16;

  static parse = (val) => {
    return val === val.toUpperCase()
      ? PieceColor.White
      : PieceColor.Black;
  };
}

class PieceType {
  static None = 0;
  static King = 1;
  static Pawn = 2;
  static Knight = 3;
  static Bishop = 4;
  static Rook = 5;
  static Queen = 6;

  static parse = (val) => {
    switch (val.toLowerCase()) {
      case 'k': return PieceType.King;
      case 'p': return PieceType.Pawn;
      case 'n': return PieceType.Knight;
      case 'b': return PieceType.Bishop;
      case 'r': return PieceType.Rook;
      case 'q': return PieceType.Queen;
      default: return PieceType.None;
    }
  };

  static toString = (val) => {
    switch (val) {
      case PieceType.King: return 'k';
      case PieceType.Pawn: return 'p';
      case PieceType.Knight: return 'n';
      case PieceType.Bishop: return 'b';
      case PieceType.Rook: return 'r';
      case PieceType.Queen: return 'q';
      default: return '';
    }
  };
}

class Piece {
  constructor(color, type) {
    this.color = color;
    this.type = type;
    this.value = color | type;
  }

  static parse = (val) => {
    const color = PieceColor.parse(val);
    const type = PieceType.parse(val);
    return new Piece(color, type);
  };

  static toString = (val) => {
    const typeString = PieceType.toString(val.type);
    return val.color === PieceColor.White ? typeString.toUpperCase() : typeString;
  };
}

class MoveType {
  static Advance = 0;
  static Capture = 1;
  static Castle = 2;
  static EnPassant = 3;
}

class Move {
  constructor(from, to, type, squares) {
    this.from = from;
    this.to = to;
    this.type = type;
    this.movePiece = squares[from].piece;
    this.capturePiece = squares[to].piece;
  }
}

class DirectionIndex {
  static North = 0;
  static South = 1;
  static West = 2;
  static East = 3;
  static NorthWest = 4;
  static SouthEast = 5;
  static NorthEast = 6;
  static SouthWest = 7;
}

class Game {
  constructor() {
    this.board = null;
    this.ctx = null;
    this.whitePieces = {};
    this.blackPieces = {};
    this.whitePieceImages = {};
    this.blackPieceImages = {};
    this.startPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    this.squareSize = 80;
    this.lightColor = '#f1d9c0';
    this.darkColor = '#a97a65';
    this.activeOverlay = '#cccc00';
    this.previousOverlay = '#cccc00';
    this.possibleOverlay = '#333333';
    this.overlayOpacity = 0.4;
    this.numSquaresToEdge = new Array(64);
    this.directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
    this.prevMoveSquares = [];
    this.possibleSquares = [];
    this.activeSquare = null;
    this.hoverX = null;
    this.hoverY = null;
    this.dragPiece = null;
    this.activeColor = null;
    this.isCapture = false;
    this.enPassantTargetSquare = null;
    this.castlingAvailability = null;
    this.halfMoveClock = null;
    this.fullMoveNumber = null;
    this.pseudoLegalMoves = [];
    this.legalMoves = [];
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
      King: new Piece(PieceColor.White, PieceType.King),
      Pawn: new Piece(PieceColor.White, PieceType.Pawn),
      Knight: new Piece(PieceColor.White, PieceType.Knight),
      Bishop: new Piece(PieceColor.White, PieceType.Bishop),
      Rook: new Piece(PieceColor.White, PieceType.Rook),
      Queen: new Piece(PieceColor.White, PieceType.Queen),
    };
    this.blackPieces = {
      King: new Piece(PieceColor.Black, PieceType.King),
      Pawn: new Piece(PieceColor.Black, PieceType.Pawn),
      Knight: new Piece(PieceColor.Black, PieceType.Knight),
      Bishop: new Piece(PieceColor.Black, PieceType.Bishop),
      Rook: new Piece(PieceColor.Black, PieceType.Rook),
      Queen: new Piece(PieceColor.Black, PieceType.Queen),
    };
    this.whitePieceImages = {
      King: Utils.getImage('white-king.svg'),
      Pawn: Utils.getImage('white-pawn.svg'),
      Knight: Utils.getImage('white-knight.svg'),
      Bishop: Utils.getImage('white-bishop.svg'),
      Rook: Utils.getImage('white-rook.svg'),
      Queen: Utils.getImage('white-queen.svg'),
    };
    this.blackPieceImages = {
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
    this.loadFen(this.startPosition);
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

  loadFen = (fen) => {
    try {
      const fenParts = fen.split(' ');
      this.parsePiecePlacement(fenParts[0]);
      this.parseActiveColor(fenParts[1]);
      this.parseCastlingAvailability(fenParts[2]);
      this.parseEnPassantTargetSquare(fenParts[3]);
      this.parseHalfMoveClock(fenParts[4]);
      this.parseFullMoveNumber(fenParts[5]);
    } catch {
      throw new Error('Invalid FEN');
    }
  };

  getFen = () => {
    const fenParts = [
      this.getPiecePlacement(),
      this.getActiveColor(),
      this.getCastlingAvailability(),
      this.getEnPassantTargetSquare(),
      this.getHalfMoveClock(),
      this.getFullMoveNumber(),
    ];
    return fenParts.join(' ');
  };

  parsePiecePlacement = (val) => {
    let file = 0, rank = 7;
    val.split('').forEach(symbol => {
      if (symbol === '/') {
        file = 0;
        rank--;
      } else if (Utils.isDigit(symbol)) {
        file += parseInt(symbol);
      } else {
        this.board.squares[rank * 8 + file].piece = Piece.parse(symbol);
        file++;
      }
    });
  };

  getPiecePlacement = () => {
    let output = '';
    for (let rank = 7; rank >= 0; rank--) {
      output += this.getFenByRank(rank);
      if (rank > 0) output += '/';
    }
    return output;
  };

  getFenByRank = (rank) => {
    let output = '';
    let consecutiveEmptySquares = 0;
    for (let file = 0; file < 8; file++) {
      const piece = this.board.squares[rank * 8 + file].piece;
      if (!piece) {
        consecutiveEmptySquares++;
        continue;
      }
      if (consecutiveEmptySquares > 0) {
        output += `${consecutiveEmptySquares}`;
      }
      consecutiveEmptySquares = 0;
      output += Piece.toString(piece);
    }
    if (consecutiveEmptySquares > 0) {
      output += `${consecutiveEmptySquares}`;
    }
    return output;
  };

  parseActiveColor = (val) => {
    switch (val.toLowerCase()) {
      case 'w': this.activeColor = PieceColor.White; break;
      case 'b': this.activeColor = PieceColor.Black; break;
      default: this.activeColor = PieceColor.None; break;
    }
  };

  getActiveColor = () => {
    switch (this.activeColor) {
      case PieceColor.White: return 'w';
      case PieceColor.Black: return 'b';
      default: return '-';
    }
  };

  parseCastlingAvailability = (val) => {
    this.castlingAvailability = [];
    if (val.indexOf('K') > -1) this.castlingAvailability.push(this.whitePieces.King);
    if (val.indexOf('Q') > -1) this.castlingAvailability.push(this.whitePieces.Queen);
    if (val.indexOf('k') > -1) this.castlingAvailability.push(this.blackPieces.King);
    if (val.indexOf('q') > -1) this.castlingAvailability.push(this.blackPieces.Queen);
  };

  getCastlingAvailability = () => {
    if (this.castlingAvailability.length === 0) return '-';
    return this.castlingAvailability.map(x => Piece.toString(x)).join('');
  };

  parseEnPassantTargetSquare = (val) => {
    this.enPassantTargetSquare = this.parseSquareIndexFromAlgebraicNotation(val);
  };

  getEnPassantTargetSquare = () => {
    return this.enPassantTargetSquare === -1
      ? '-'
      : this.board.squares[this.enPassantTargetSquare].algebraicNotation;
  };

  parseHalfMoveClock = (val) => { this.halfMoveClock = parseInt(val) || 0; };

  getHalfMoveClock = () => `${this.halfMoveClock}`;

  parseFullMoveNumber = (val) => { this.fullMoveNumber = parseInt(val) || 1; };

  getFullMoveNumber = () => `${this.fullMoveNumber}`;

  onMouseDown = (e) => {
    const square = this.getEventSquare(e);
    if (square === this.activeSquare) {
      this.deselect = true;
    }
    if (square.piece && square.piece.color === this.activeColor) {
      this.initDrag(square);
      this.initMove(square);
      this.setHover(e);
    }
  };

  onMouseUp = (e) => {
    if (!this.activeSquare) return;
    if (this.dragPiece) {
      this.cancelDrag();
    }
    const square = this.getEventSquare(e);
    if (square === this.activeSquare && this.deselect) {
      this.clearActiveSquare();
      this.clearPossibleSquares();
      this.deselect = false;
    } else if (this.isLegalMove(square)) {
      this.doMove(square);
    }
  };

  onMouseMove = (e) => {
    this.setHover(e);
  };

  onMouseOut = () => {
    if (this.dragPiece) {
      this.cancelDrag();
      this.activeSquare = null;
      this.clearPossibleSquares();
    }
  };

  setHover = (e) => {
    this.hoverX = e.offsetX;
    this.hoverY = e.offsetY;
  };

  getEventSquare = (e) => {
    const rank = 7 - Math.floor(e.offsetY / this.squareSize);
    const file = Math.floor(e.offsetX / this.squareSize);
    return this.board.squares[rank * 8 + file];
  };

  initDrag = (fromSquare) => {
    this.dragPiece = fromSquare.piece;
  };

  cancelDrag = () => {
    if (this.activeSquare) {
      this.activeSquare.piece = this.dragPiece;
    }
    this.dragPiece = null;
  };

  initMove = (fromSquare) => {
    fromSquare.piece = null;
    this.activeSquare = fromSquare;
    this.possibleSquares = this.legalMoves
      .filter(move => move.from === fromSquare.index)
      .map(move => move.to);
  };

  doMove = (toSquare) => {
    const movePiece = this.getMovePiece(toSquare);
    const moveType = this.getMoveType(movePiece.type, toSquare);
    switch (moveType) {
      case MoveType.Advance:
        this.handleAdvance(movePiece, toSquare);
        break;
      case MoveType.Capture:
        this.handleCapture(movePiece, toSquare);
        break;
      case MoveType.EnPassant:
        this.handleEnPassant(movePiece, toSquare);
        break;
      case MoveType.Castle:
        this.handleCastle(movePiece, toSquare);
        break;
    }
    this.postMoveActions(toSquare);
  };

  getMoveType = (pieceType, toSquare) => {
    if (this.isEnPassant(pieceType, toSquare)) return MoveType.EnPassant;
    if (this.isCastle(pieceType, toSquare)) return MoveType.Castle;
    return toSquare.piece ? MoveType.Capture : MoveType.Advance;
  };

  isEnPassant = (pieceType, toSquare) => (
    pieceType === PieceType.Pawn && toSquare.index === this.enPassantTargetSquare
  );

  isCastle = (pieceType, toSquare) => (
    pieceType === PieceType.King && Math.abs(this.activeSquare.index - toSquare.index) === 2
  );

  handleAdvance = (movePiece, toSquare) => {
    this.isCapture = false;
    toSquare.piece = movePiece;
    this.activeSquare.piece = null;
  };

  handleCapture = (movePiece, toSquare) => {
    this.isCapture = true;
    toSquare.piece = movePiece;
    this.activeSquare.piece = null;
  };

  handleEnPassant = (movePiece, toSquare) => {
    this.isCapture = true;
    toSquare.piece = movePiece;
    this.activeSquare.piece = null;
    const offset = movePiece.color === PieceColor.White ? -8 : 8;
    const captureSquareIndex = toSquare.index + offset;
    this.board.squares[captureSquareIndex].piece = null;
  };

  handleCastle = (movePiece, toSquare) => {
    this.isCapture = false;
    toSquare.piece = movePiece;
    this.activeSquare.piece = null;
    const isKingSide = toSquare.file === 6;
    const rookRank = movePiece.color === PieceColor.White ? 0 : 7;
    const rookFile = isKingSide ? 7 : 0;
    const targetFile = isKingSide ? 5 : 3;
    const rookSquare = this.board.squares[rookRank * 8 + rookFile];
    const targetSquare = this.board.squares[rookRank * 8 + targetFile];
    targetSquare.piece = rookSquare.piece;
    rookSquare.piece = null;
  };

  postMoveActions = (toSquare) => {
    this.setPrevMoveSquares(toSquare);
    this.setEnPassantTargetSquare(toSquare);
    this.updateCastlingAvailability(toSquare);
    this.setHalfMoveClock(toSquare);
    this.updateFullMoveNumber(toSquare);
    this.clearActiveSquare();
    this.clearPossibleSquares();
    this.togglePlayerTurn();
    this.generateMoves();
    this.testForCheck();
  };

  setPrevMoveSquares = (toSquare) => {
    this.prevMoveSquares = [this.activeSquare, toSquare];
  };

  setEnPassantTargetSquare = (toSquare) => {
    const isPawn = toSquare.piece.type === PieceType.Pawn;
    const distance = Math.abs(toSquare.index - this.activeSquare.index);
    const color = toSquare.piece.color;
    const targetOffset = color === PieceColor.White ? -8 : 8;
    this.enPassantTargetSquare = isPawn && distance === 16
      ? toSquare.index + targetOffset
      : -1;
  };

  updateCastlingAvailability = (toSquare) => {
    if (this.castlingAvailability.length === 0) return;
    const { color, type } = toSquare.piece || {};
    const fromFile = this.activeSquare.file;
    if (type === PieceType.King) {
      this.castlingAvailability = this.castlingAvailability
        .filter(x => x.color !== color);
    } else if (type === PieceType.Rook && [0, 7].includes(fromFile)) {
      const side = fromFile === 0 ? PieceType.Queen : PieceType.King;
      this.castlingAvailability = this.castlingAvailability
        .filter(x => x.color !== color || x.type !== side);
    }
  };

  setHalfMoveClock = (toSquare) => {
    const isPawn = toSquare.piece.type === PieceType.Pawn;
    this.halfMoveClock = this.isCapture || isPawn ? 0 : this.halfMoveClock + 1;
  };

  updateFullMoveNumber = (toSquare) => {
    if (toSquare.piece.color === PieceColor.Black) {
      this.fullMoveNumber++;
    }
  };

  getMovePiece = (toSquare) => {
    const toSquarePiece = this.dragPiece || this.activeSquare.piece;
    if (toSquarePiece.type === PieceType.Pawn) {
      const promotionRank = toSquarePiece.color === PieceColor.White ? 7 : 0;
      if (toSquare.rank === promotionRank) {
        toSquarePiece.type = PieceType.Queen;
      }
    }
    return toSquarePiece;
  };

  isLegalMove = (toSquare) => {
    const legalMove = this.legalMoves.find(move =>
      move.from === this.activeSquare.index
      && move.to === toSquare.index);
    return !!legalMove;
  };

  togglePlayerTurn = () => {
    this.activeColor = this.activeColor === PieceColor.White
      ? PieceColor.Black
      : PieceColor.White;
  };

  clearActiveSquare = () => {
    this.activeSquare = null;
  };

  clearPossibleSquares = () => {
    this.possibleSquares = [];
  };

  parseSquareIndexFromAlgebraicNotation = (val) => {
    try {
      const file = 'abcdefgh'.indexOf(val[0]);
      const rank = parseInt(val[1]) || -1;
      return (file === -1 || rank === -1) ? -1 : rank * 8 + file;
    } catch {
      return -1;
    }
  };

  proportion = (ratio) => Math.floor(this.squareSize * ratio);

  draw = () => {
    this.board.draw();
    if (this.dragPiece) {
      this.drawDragPiece();
    }
  };

  drawDragPiece = () => {
    const img = this.getPieceImage(this.dragPiece);
    const size = this.proportion(0.8);
    const x = this.hoverX - (size / 2);
    const y = this.hoverY - (size / 2);
    this.ctx.drawImage(img, x, y, size, size);
  };

  getPieceImage = (piece) => {
    if (!piece) return null;
    let set;
    switch (piece.color) {
      case PieceColor.White: set = this.whitePieceImages; break;
      case PieceColor.Black: set = this.blackPieceImages; break;
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
  };

  generateMoves = () => {
    this.pseudoLegalMoves = this.generatePseudoLegalMoves();
    this.legalMoves = this.generateLegalMoves();
  };

  generatePseudoLegalMoves = () => {
    const moves = [];

    for (let fromIndex = 0; fromIndex < 64; fromIndex++) {
      const piece = this.board.squares[fromIndex].piece;
      if (!piece) continue;

      switch (piece.type) {
        case PieceType.Pawn:
          moves.push(...this.generatePawnMoves(fromIndex, piece));
          break;
        case PieceType.Knight:
          moves.push(...this.generateKnightMoves(fromIndex, piece));
          break;
        case PieceType.King:
          moves.push(...this.generateKingMoves(fromIndex, piece));
          break;
        case PieceType.Bishop:
        case PieceType.Rook:
        case PieceType.Queen:
          moves.push(...this.generateSlidingMoves(fromIndex, piece));
          break;
      }
    }

    return moves;
  };

  generateLegalMoves = () => {
    // todo : test for putting yourself in check
    return this.pseudoLegalMoves.filter(move => move.movePiece.color === this.activeColor);
  };

  generatePawnMoves = (fromIndex, piece) => {
    const moves = [];

    const moveForward = piece.color === PieceColor.White ? DirectionIndex.North : DirectionIndex.South;
    const attackLeft = piece.color === PieceColor.White ? DirectionIndex.NorthWest : DirectionIndex.SouthEast;
    const attackRight = piece.color === PieceColor.White ? DirectionIndex.NorthEast : DirectionIndex.SouthWest;

    // check one square forward
    const forwardSquareIndex = fromIndex + this.directionOffsets[moveForward];
    const forwardSquarePiece = this.board.squares[forwardSquareIndex].piece;
    if (!forwardSquarePiece) {
      moves.push(new Move(fromIndex, forwardSquareIndex, MoveType.Advance, this.board.squares));
    }

    // check two squares forward
    const rank = Math.floor(fromIndex / 8);
    const isFirstMove = (
      (piece.color === PieceColor.White && rank === 1)
      ||
      (piece.color === PieceColor.Black && rank === 6)
    );
    if (isFirstMove) {
      const doubleSquareIndex = forwardSquareIndex + this.directionOffsets[moveForward];
      const doubleSquarePiece = this.board.squares[doubleSquareIndex].piece;
      if (!forwardSquarePiece && !doubleSquarePiece) {
        moves.push(new Move(fromIndex, doubleSquareIndex, MoveType.Advance, this.board.squares));
      }
    }

    // check attack left
    const attackLeftSquareIndex = fromIndex + this.directionOffsets[attackLeft];
    const attackLeftSquarePiece = this.board.squares[attackLeftSquareIndex].piece;
    const isAttackLeftOpponent = attackLeftSquarePiece && attackLeftSquarePiece.color !== this.activeColor;
    if (isAttackLeftOpponent) {
      moves.push(new Move(fromIndex, attackLeftSquareIndex, MoveType.Capture, this.board.squares));
    }
    
    // check attack right
    const attackRightSquareIndex = fromIndex + this.directionOffsets[attackRight];
    const attackRightSquarePiece = this.board.squares[attackRightSquareIndex].piece;
    const isAttackRightOpponent = attackRightSquarePiece && attackRightSquarePiece.color !== this.activeColor;
    if (isAttackRightOpponent) {
      moves.push(new Move(fromIndex, attackRightSquareIndex, MoveType.Capture, this.board.squares));
    }

    // check en passant
    if ([attackLeftSquareIndex, attackRightSquareIndex].includes(this.enPassantTargetSquare)) {
      moves.push(new Move(fromIndex, this.enPassantTargetSquare, MoveType.EnPassant, this.board.squares));
    }

    return moves;
  };

  generateKnightMoves = (fromIndex, piece) => {
    const moves = [];

    const checkMove = (passingIndex, dirIndex) => {
      const toIndex = passingIndex + this.directionOffsets[dirIndex];
      const toPiece = this.board.squares[toIndex].piece;

      // blocked by friendly piece
      if (toPiece && toPiece.color === this.activeColor) return;

      const moveType = toPiece ? MoveType.Capture : MoveType.Advance;

      moves.push(new Move(fromIndex, toIndex, moveType, this.board.squares));
    };

    const northEdge = this.numSquaresToEdge[fromIndex][DirectionIndex.North];
    const southEdge = this.numSquaresToEdge[fromIndex][DirectionIndex.South];
    const westEdge = this.numSquaresToEdge[fromIndex][DirectionIndex.West];
    const eastEdge = this.numSquaresToEdge[fromIndex][DirectionIndex.East];

    if (northEdge > 1) {
      const northIndex = fromIndex + this.directionOffsets[DirectionIndex.North];
      if (westEdge > 0) checkMove(northIndex, DirectionIndex.NorthWest);
      if (eastEdge > 0) checkMove(northIndex, DirectionIndex.NorthEast);
    }

    if (southEdge > 1) {
      const southIndex = fromIndex + this.directionOffsets[DirectionIndex.South];
      if (westEdge > 0) checkMove(southIndex, DirectionIndex.SouthWest);
      if (eastEdge > 0) checkMove(southIndex, DirectionIndex.SouthEast);
    }

    if (westEdge > 1) {
      const westIndex = fromIndex + this.directionOffsets[DirectionIndex.West];
      if (northEdge > 0) checkMove(westIndex, DirectionIndex.NorthWest);
      if (southEdge > 0) checkMove(westIndex, DirectionIndex.SouthWest);
    }

    if (eastEdge > 1) {
      const eastIndex = fromIndex + this.directionOffsets[DirectionIndex.East];
      if (northEdge > 0) checkMove(eastIndex, DirectionIndex.NorthEast);
      if (southEdge > 0) checkMove(eastIndex, DirectionIndex.SouthEast);
    }

    return moves;
  };

  generateKingMoves = (fromIndex, piece) => {
    const moves = [];

    for (let dirIndex = 0; dirIndex < 8; dirIndex++) {
      const toIndex = fromIndex + this.directionOffsets[dirIndex];

      // blocked by edge of board
      if (this.numSquaresToEdge[fromIndex][dirIndex] === 0) continue;

      const toPiece = this.board.squares[toIndex].piece;

      // blocked by friendly piece
      if (toPiece && toPiece.color === this.activeColor) continue;

      const moveType = toPiece ? MoveType.Capture : MoveType.Advance;

      moves.push(new Move(fromIndex, toIndex, moveType, this.board.squares));
    }

    // add castling moves
    this.castlingAvailability
      .filter(x => x.color === this.activeColor)
      .forEach(x => {
        const dirIndex = x.type === PieceType.King ? DirectionIndex.East : DirectionIndex.West;
        const offset = this.directionOffsets[dirIndex];
        const passingSquare = this.board.squares[fromIndex + offset];
        const landingSquare = this.board.squares[fromIndex + (offset * 2)];
        if (passingSquare.piece || landingSquare.piece) return;
        moves.push(new Move(fromIndex, fromIndex + (offset * 2), MoveType.Castle, this.board.squares));
      });

    return moves;
  };

  generateSlidingMoves = (fromIndex, piece) => {
    const moves = [];

    const startDirIndex = piece.type === PieceType.Bishop ? 4 : 0;
    const endDirIndex = piece.type === PieceType.Rook ? 4 : 8;

    for (let dirIndex = startDirIndex; dirIndex < endDirIndex; dirIndex++) {
      for (let n = 0; n < this.numSquaresToEdge[fromIndex][dirIndex]; n++) {
        const toIndex = fromIndex + this.directionOffsets[dirIndex] * (n + 1);
        const toPiece = this.board.squares[toIndex].piece;

        // blocked by friendly piece, so can't move any further in this direction
        if (toPiece && toPiece.color === this.activeColor) break;

        const moveType = toPiece ? MoveType.Capture : MoveType.Advance;

        moves.push(new Move(fromIndex, toIndex, moveType, this.board.squares));

        // can't move any further in this direction after capturing opponent's piece
        if (toPiece && toPiece.color !== this.activeColor) break;
      }
    }

    return moves;
  };

  testForCheck = () => {
    // todo
  };
}

class Board {
  constructor(game, board) {
    this.game = game;
    this.squares = new Array(64);
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const index = rank * 8 + file;
        this.squares[index] = new Square(file, rank, game);
        if (!board) continue;
        const piece = board.squares[index].piece;
        if (!piece) continue;
        this.squares[index].piece = new Piece(piece.color, piece.type);
      }
    }
  }

  draw = () => { this.squares.forEach(sq => sq.draw()); };
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
  get algebraicNotation() { return `${'abcdefgh'[this.file]}${this.rank + 1}`; }

  draw = () => {
    this.game.ctx.fillStyle = this.squareColor;
    this.game.ctx.fillRect(this.xPos, this.yPos, this.game.squareSize, this.game.squareSize);

    if (this.file === 0) {
      this.drawRankLabel();
    }

    if (this.rank === 0) {
      this.drawFileLabel();
    }

    if ([this.game.activeSquare].includes(this)) {
      this.drawOverlay(this.game.activeOverlay);
    }

    if (this.game.prevMoveSquares.includes(this)) {
      this.drawOverlay(this.game.previousOverlay);
    }

    if (this.piece) {
      this.drawPiece();
    }

    if (this.game.possibleSquares.includes(this.index)) {
      this.drawPossibleOverlay();
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
  };

  drawPossibleOverlay = () => {
    if (this.piece) {
      this.drawPossibleOverlayOccupied();
    } else {
      this.drawPossibleOverlayEmpty();
    }
  };

  drawPossibleOverlayEmpty = () => {
    const offset = this.game.proportion(0.5);
    const radius = this.game.proportion(0.17);
    this.game.ctx.globalAlpha = 0.2;
    this.game.ctx.beginPath();
    this.game.ctx.arc(this.xPos + offset, this.yPos + offset, radius, 0, 2 * Math.PI, false);
    this.game.ctx.fillStyle = this.game.possibleOverlay;
    this.game.ctx.fill();
    this.game.ctx.globalAlpha = 1.0;
  };

  drawPossibleOverlayOccupied = () => {
    const offset = this.game.proportion(0.5);
    const radius = this.game.proportion(0.46);
    this.game.ctx.globalAlpha = 0.2;
    this.game.ctx.beginPath();
    this.game.ctx.arc(this.xPos + offset, this.yPos + offset, radius, 0, 2 * Math.PI, false);
    this.game.ctx.lineWidth = 7;
    this.game.ctx.strokeStyle = this.game.possibleOverlay;
    this.game.ctx.stroke();
    this.game.ctx.globalAlpha = 1.0;
  };

  drawPiece = () => {
    const img = this.game.getPieceImage(this.piece);
    const offset = this.game.proportion(0.1);
    const size = this.game.proportion(0.8);
    const x = this.xPos + offset;
    const y = this.yPos + offset;
    this.game.ctx.drawImage(img, x, y, size, size);
  };
}
