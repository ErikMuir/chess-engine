let _game;
let _board;

window.onload = () => {
  const startPosition = Constants.startPosition;
  const pawnPromotionTest = 'k/7P//////K w - - 0 0';
  _game = new Game({ fen: startPosition });
  _board = new Board(_game);
}

/**
 * FEATURES
 * ------------------------------------
 *  pawn promotion (non-queen options)
 *  checkmate modal
 *  determine best move
 * 
 * BUGS
 * ------------------------------------
 */

class Constants {
  static squareSize = 80;
  static lightColor = '#f1d9c0';
  static darkColor = '#a97a65';
  static activeOverlay = '#cccc00';
  static previousOverlay = '#cccc00';
  static possibleOverlay = '#333333';
  static overlayOpacity = 0.4;
  static directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
  static startPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
}

class Utils {
  static isDigit = (str) => /^\d+$/.test(str);

  static proportion = (ratio) => Math.floor(Constants.squareSize * ratio);

  static getImage = (filename) => {
    var img = new Image();
    img.src = `./images/${filename}`;
    return img;
  };

  static getFile = (index) => index % 8;

  static getRank = (index) => Math.floor(index / 8);
}

class PieceColor {
  static none = 0;
  static white = 8;
  static black = 16;

  static fromPieceValue = (val) => {
    if (val >= PieceColor.black) return PieceColor.black;
    if (val >= PieceColor.white) return PieceColor.white;
    return PieceColor.none;
  }

  static fromFEN = (val) => {
    return val === val.toUpperCase()
      ? PieceColor.white
      : PieceColor.black;
  };

  static updateCasing = (symbol, color) => {
    return color === PieceColor.white
      ? symbol.toUpperCase()
      : symbol.toLowerCase();
  }

  static toString = (val, opposite = false) => {
    switch (val) {
      case PieceColor.white: return opposite ? 'black' : 'white';
      case PieceColor.black: return opposite ? 'white' : 'black';
      default: return '';
    }
  }
}

class PieceType {
  static none = 0;
  static king = 1;
  static pawn = 2;
  static knight = 3;
  static bishop = 4;
  static rook = 5;
  static queen = 6;

  static fromPieceValue = (val) => {
    switch (val % 8) {
      case 1: return PieceType.king;
      case 2: return PieceType.pawn;
      case 3: return PieceType.knight;
      case 4: return PieceType.bishop;
      case 5: return PieceType.rook;
      case 6: return PieceType.queen;
      default: return PieceType.none;
    }
  };

  static fromFEN = (val) => {
    switch (val.toLowerCase()) {
      case 'k': return PieceType.king;
      case 'p': return PieceType.pawn;
      case 'n': return PieceType.knight;
      case 'b': return PieceType.bishop;
      case 'r': return PieceType.rook;
      case 'q': return PieceType.queen;
      default: return PieceType.none;
    }
  };

  static toString = (val) => {
    switch (val) {
      case PieceType.king: return 'k';
      case PieceType.pawn: return 'p';
      case PieceType.knight: return 'n';
      case PieceType.bishop: return 'b';
      case PieceType.rook: return 'r';
      case PieceType.queen: return 'q';
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

  static fromPieceValue = (val) => {
    if (!val) return null;
    const color = PieceColor.fromPieceValue(val);
    const type = PieceType.fromPieceValue(val);
    return new Piece(color, type);
  };

  static fromFEN = (val) => {
    const color = PieceColor.fromFEN(val);
    const type = PieceType.fromFEN(val);
    return new Piece(color, type);
  };

  static toString = (val) => {
    const symbol = PieceType.toString(val.type);
    return PieceColor.updateCasing(symbol, val.color);
  };
}

class MoveType {
  static advance = 0;
  static capture = 1;
  static castle = 2;
  static enPassant = 3;
}

class Move {
  constructor(fromIndex, toIndex, type, squares) {
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.type = type;
    this.movePiece = squares[fromIndex];
    this.capturePiece = squares[toIndex];
    this.isPawnPromotion = this.isPawn() && this.isPromotionRank();
  }

  isPawn = () => PieceType.fromPieceValue(this.movePiece) === PieceType.pawn;

  isPromotionRank = () => {
    const toRank = Utils.getRank(this.toIndex);
    const promotionRank = PieceColor.fromPieceValue(this.movePiece) === PieceColor.white ? 7 : 0;
    return toRank === promotionRank;
  };
}

class DirectionIndex {
  static north = 0;
  static south = 1;
  static west = 2;
  static east = 3;
  static northWest = 4;
  static southEast = 5;
  static northEast = 6;
  static southWest = 7;
}

class Fen {
  static load = (fen, game) => {
    try {
      const fenParts = fen.split(' ');
      Fen.parsePiecePlacement(fenParts[0], game);
      Fen.parseActivePlayer(fenParts[1], game);
      Fen.parseCastlingAvailability(fenParts[2], game);
      Fen.parseEnPassantTargetSquare(fenParts[3], game);
      Fen.parseHalfMoveClock(fenParts[4], game);
      Fen.parseFullMoveNumber(fenParts[5], game);
    } catch (e) {
      throw new Error('Invalid FEN');
    }
  };

  static get = (game) => {
    const fenParts = [
      Fen.getPiecePlacement(game),
      Fen.getActivePlayer(game),
      Fen.getCastlingAvailability(game),
      Fen.getEnPassantTargetSquare(game),
      Fen.getHalfMoveClock(game),
      Fen.getFullMoveNumber(game),
    ];
    return fenParts.join(' ');
  };

  static parsePiecePlacement = (val, game) => {
    let file = 0, rank = 7;
    val.split('').forEach(symbol => {
      if (symbol === '/') {
        file = 0;
        rank--;
      } else if (Utils.isDigit(symbol)) {
        file += parseInt(symbol);
      } else {
        game.squares[rank * 8 + file] = Piece.fromFEN(symbol).value;
        file++;
      }
    });
  };

  static getPiecePlacement = (game) => {
    let output = '';
    for (let rank = 7; rank >= 0; rank--) {
      output += Fen.getFenByRank(rank, game);
      if (rank > 0) output += '/';
    }
    return output;
  };

  static getFenByRank = (rank, game) => {
    let output = '';
    let consecutiveEmptySquares = 0;
    for (let file = 0; file < 8; file++) {
      const pieceValue = game.squares[rank * 8 + file];
      if (!pieceValue) {
        consecutiveEmptySquares++;
        continue;
      }
      if (consecutiveEmptySquares > 0) {
        output += `${consecutiveEmptySquares}`;
      }
      consecutiveEmptySquares = 0;
      const piece = Piece.fromPieceValue(pieceValue);
      output += Piece.toString(piece);
    }
    return output;
  };

  static parseActivePlayer = (val, game) => {
    switch (val.toLowerCase()) {
      case 'w': game.activePlayer = PieceColor.white; break;
      case 'b': game.activePlayer = PieceColor.black; break;
      default: game.activePlayer = PieceColor.none; break;
    }
  };

  static getActivePlayer = (game) => {
    switch (game.activePlayer) {
      case PieceColor.white: return 'w';
      case PieceColor.black: return 'b';
      default: return '-';
    }
  };

  static parseCastlingAvailability = (val, game) => {
    game.castlingAvailability = [];
    if (val.indexOf('K') > -1) game.castlingAvailability.push(new Piece(PieceColor.white, PieceType.king));
    if (val.indexOf('Q') > -1) game.castlingAvailability.push(new Piece(PieceColor.white, PieceType.queen));
    if (val.indexOf('k') > -1) game.castlingAvailability.push(new Piece(PieceColor.black, PieceType.king));
    if (val.indexOf('q') > -1) game.castlingAvailability.push(new Piece(PieceColor.black, PieceType.queen));
  };

  static getCastlingAvailability = (game) => {
    if (game.castlingAvailability.length === 0) return '-';
    return game.castlingAvailability.map(x => Piece.toString(x)).join('');
  };

  static parseEnPassantTargetSquare = (val, game) => {
    game.enPassantTargetSquare = Fen.getSquareIndexFromAlgebraicNotation(val);
  };

  static getEnPassantTargetSquare = (game) => {
    return game.enPassantTargetSquare === -1
      ? '-'
      : Fen.getAlgebraicNotationFromSquareIndex(game.enPassantTargetSquare);
  };

  static parseHalfMoveClock = (val, game) => { game.halfMoveClock = parseInt(val) || 0; };

  static getHalfMoveClock = (game) => `${game.halfMoveClock}`;

  static parseFullMoveNumber = (val, game) => { game.fullMoveNumber = parseInt(val) || 1; };

  static getFullMoveNumber = (game) => `${game.fullMoveNumber}`;

  static getSquareIndexFromAlgebraicNotation = (val) => {
    try {
      const file = 'abcdefgh'.indexOf(val[0]);
      const rank = parseInt(val[1]) || -1;
      return (file === -1 || rank === -1) ? -1 : rank * 8 + file;
    } catch {
      return -1;
    }
  };

  static getAlgebraicNotationFromSquareIndex = (index) => {
    const rank = Utils.getRank(index);
    const file = Utils.getFile(index);
    return `${'abcdefgh'[file]}${rank + 1}`;
  };
}

class Board {
  constructor(game) {
    this.game = game;
    this.squares = new Array(64);

    this.ctx = null;
    this.whitePieceImages = {};
    this.blackPieceImages = {};
    this.activeSquare = null;
    this.possibleSquares = [];
    this.previousMove = {};
    this.dragPiece = null;
    this.deselect = false;
    this.gameOver = false;

    this.initCanvas();
    this.initPieces();
    this.initSquares();
    setInterval(this.draw, 10);
  }

  initCanvas = () => {
    const canvas = document.getElementById('canvas');
    canvas.width = Constants.squareSize * 8;
    canvas.height = Constants.squareSize * 8;
    canvas.onmousedown = this.onMouseDown;
    canvas.onmouseup = this.onMouseUp;
    canvas.onmousemove = this.onMouseMove;
    canvas.onmouseout = this.onMouseOut;
    this.ctx = canvas.getContext('2d');
  };

  initPieces = () => {
    this.whitePieceImages = {
      king: Utils.getImage('white-king.svg'),
      pawn: Utils.getImage('white-pawn.svg'),
      knight: Utils.getImage('white-knight.svg'),
      bishop: Utils.getImage('white-bishop.svg'),
      rook: Utils.getImage('white-rook.svg'),
      queen: Utils.getImage('white-queen.svg'),
    };
    this.blackPieceImages = {
      king: Utils.getImage('black-king.svg'),
      pawn: Utils.getImage('black-pawn.svg'),
      knight: Utils.getImage('black-knight.svg'),
      bishop: Utils.getImage('black-bishop.svg'),
      rook: Utils.getImage('black-rook.svg'),
      queen: Utils.getImage('black-queen.svg'),
    };
  };

  initSquares = () => {
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const index = rank * 8 + file;
        const square = new Square(file, rank, this);
        const pieceValue = this.game.squares[index];
        square.piece = pieceValue ? Piece.fromPieceValue(pieceValue) : null;
        this.squares[index] = square;
      }
    }
  };

  refresh = () => {
    this.clearPossibleSquares();
    for (let i = 0; i < 64; i++) {
      const pieceValue = this.game.squares[i];
      this.squares[i].piece = pieceValue ? Piece.fromPieceValue(pieceValue) : null;
    }
  };

  draw = () => {
    this.squares.forEach(sq => sq.draw(this.ctx));
    this.drawDragPiece(this.ctx);
  };

  drawDragPiece = (ctx) => {
    if (!this.dragPiece) return;
    const img = this.getPieceImage(this.dragPiece);
    const size = Utils.proportion(0.8);
    const x = this.hoverX - (size / 2);
    const y = this.hoverY - (size / 2);
    ctx.drawImage(img, x, y, size, size);
  };

  onMouseDown = (e) => {
    if (this.gameOver) return;
    const square = this.getEventSquare(e);
    if (square === this.activeSquare) {
      this.deselect = true;
    }
    if (square.piece && square.piece.color === this.game.activePlayer) {
      this.initDrag(square);
      this.initMove(square);
      this.setHover(e);
    }
  };

  onMouseUp = (e) => {
    if (!this.activeSquare) return;
    if (this.dragPiece) this.cancelDrag();

    const square = this.getEventSquare(e);
    if (square === this.activeSquare && this.deselect) {
      this.clearActiveSquare();
      this.clearPossibleSquares();
      this.deselect = false;
      return;
    }

    const move = this.getLegalMove(square);
    if (move) this.doMove(move);
  };

  onMouseMove = (e) => {
    this.setHover(e);
  };

  onMouseOut = () => {
    if (this.dragPiece) {
      this.cancelDrag();
      this.clearActiveSquare();
      this.clearPossibleSquares();
    }
  };

  setHover = (e) => {
    this.hoverX = e.offsetX;
    this.hoverY = e.offsetY;
  };

  getEventSquare = (e) => {
    const rank = 7 - Math.floor(e.offsetY / Constants.squareSize);
    const file = Math.floor(e.offsetX / Constants.squareSize);
    return this.squares[rank * 8 + file];
  };

  getPieceImage = (piece) => {
    if (!piece) return null;
    let set;
    switch (piece.color) {
      case PieceColor.white: set = this.whitePieceImages; break;
      case PieceColor.black: set = this.blackPieceImages; break;
    }
    switch (piece.type) {
      case PieceType.king: return set.king;
      case PieceType.pawn: return set.pawn;
      case PieceType.knight: return set.knight;
      case PieceType.bishop: return set.bishop;
      case PieceType.rook: return set.rook;
      case PieceType.queen: return set.queen;
      default: return null;
    }
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
    this.possibleSquares = this.game.legalMoves
      .filter(move => move.fromIndex === fromSquare.index)
      .map(move => move.toIndex);
  };

  doMove = (move) => {
    this.game.doMove(move);
    this.refresh();
    this.game.postMoveActions(move);
    this.setPreviousMove(move);
    this.testForCheckOrMate();
  };

  clearActiveSquare = () => {
    this.activeSquare = null;
  };

  clearPossibleSquares = () => {
    this.possibleSquares = [];
  };

  setPreviousMove = (move) => {
    this.previousMove = move;
  };

  getLegalMove = (toSquare) => this.game.legalMoves
    .find(move =>
      move.fromIndex === this.activeSquare.index
      && move.toIndex === toSquare.index);

  testForCheckOrMate = () => {
    const isCheck = this.game.testForCheck();
    if (!isCheck) return;
    const isMate = this.game.legalMoves.length === 0;
    if (isMate) this.gameOver = true;
    this.logAction(isMate ? 'mate' : 'check');
  }

  logAction = (action) => {
    const player = PieceColor.toString(this.game.activePlayer);
    const opponent = PieceColor.toString(this.game.activePlayer, 'opponent');
    const msg = `${opponent} ${action}s ${player}!`;
    console.log(msg);
  };
}

class Square {
  constructor(file, rank, board) {
    this.file = file;
    this.rank = rank;
    this.board = board;
    this.piece = null;
    this.index = rank * 8 + file;
    this.isLightSquare = (file + rank) % 2 === 1;
  }

  get squareColor() { return this.isLightSquare ? Constants.lightColor : Constants.darkColor; }
  get textColor() { return this.isLightSquare ? Constants.darkColor : Constants.lightColor; }
  get xPos() { return this.file * Constants.squareSize; }
  get yPos() { return (Constants.squareSize * 7) - (this.rank * Constants.squareSize); }
  get algebraicNotation() { return `${'abcdefgh'[this.file]}${this.rank + 1}`; }

  getPieceImage = () => this.board.getPieceImage(this.piece);

  draw = (ctx) => {
    const { activeSquare, possibleSquares, previousMove } = this.board;

    this.drawBackground(ctx);

    if (this.file === 0) {
      this.drawRankLabel(ctx);
    }

    if (this.rank === 0) {
      this.drawFileLabel(ctx);
    }

    if ([activeSquare].includes(this)) {
      this.drawActiveOverlay(ctx);
    }

    if (previousMove && [previousMove.fromIndex, previousMove.toIndex].includes(this.index)) {
      this.drawPreviousOverlay(ctx);
    }

    if (this.piece) {
      this.drawPiece(ctx);
    }

    if (possibleSquares.includes(this.index)) {
      this.drawPossibleOverlay(ctx);
    }
  };

  drawBackground = (ctx) => {
    ctx.fillStyle = this.squareColor;
    ctx.fillRect(this.xPos, this.yPos, Constants.squareSize, Constants.squareSize);
  };

  drawRankLabel = (ctx) => {
    const rankText = `${this.rank + 1}`;
    const x = this.xPos + Utils.proportion(0.05);
    const y = this.yPos + Utils.proportion(0.2);
    ctx.fillStyle = this.textColor;
    ctx.font = `400 ${Utils.proportion(0.175)}px sans-serif`;
    ctx.fillText(rankText, x, y);
  };

  drawFileLabel = (ctx) => {
    const fileText = 'abcdefgh'[this.file];
    const x = this.xPos + Constants.squareSize - Utils.proportion(0.15);
    const y = this.yPos + Constants.squareSize - Utils.proportion(0.075);
    ctx.fillStyle = this.textColor;
    ctx.font = `400 ${Utils.proportion(0.175)}px sans-serif`;
    ctx.fillText(fileText, x, y);
  };

  drawActiveOverlay = (ctx) => {
    ctx.fillStyle = Constants.activeOverlay;
    ctx.globalAlpha = Constants.overlayOpacity;
    ctx.fillRect(this.xPos, this.yPos, Constants.squareSize, Constants.squareSize);
    ctx.globalAlpha = 1.0;
  };

  drawPreviousOverlay = (ctx) => {
    ctx.fillStyle = Constants.previousOverlay;
    ctx.globalAlpha = Constants.overlayOpacity;
    ctx.fillRect(this.xPos, this.yPos, Constants.squareSize, Constants.squareSize);
    ctx.globalAlpha = 1.0;
  };

  drawPossibleOverlay = (ctx) => {
    if (this.piece) {
      this.drawPossibleOverlayOccupied(ctx);
    } else {
      this.drawPossibleOverlayEmpty(ctx);
    }
  };

  drawPossibleOverlayEmpty = (ctx) => {
    const offset = Utils.proportion(0.5);
    const radius = Utils.proportion(0.17);
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(this.xPos + offset, this.yPos + offset, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = Constants.possibleOverlay;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  };

  drawPossibleOverlayOccupied = (ctx) => {
    const offset = Utils.proportion(0.5);
    const radius = Utils.proportion(0.46);
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(this.xPos + offset, this.yPos + offset, radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 7;
    ctx.strokeStyle = Constants.possibleOverlay;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  };

  drawPiece = (ctx) => {
    const img = this.getPieceImage();
    const offset = Utils.proportion(0.1);
    const size = Utils.proportion(0.8);
    const x = this.xPos + offset;
    const y = this.yPos + offset;
    ctx.drawImage(img, x, y, size, size);
  };
}

class Game {
  constructor({ fen = Constants.startPosition, preventRecursion = false } = {}) {
    this.squares = new Array(64);
    this.numSquaresToEdge = new Array(64);
    this.activePlayer = null;
    this.isCapture = false;
    this.enPassantTargetSquare = null;
    this.castlingAvailability = [];
    this.halfMoveClock = null;
    this.fullMoveNumber = null;
    this.pseudoLegalMoves = [];
    this.legalMoves = [];
    
    this.preventRecursion = preventRecursion;
    Fen.load(fen, this);
    this.init();
    this.generateMoves();
  }

  init = () => {
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

  doMove = (move) => {
    this.squares[move.fromIndex] = null;
    this.squares[move.toIndex] = this.getMovePiece(move);
    switch (move.type) {
      case MoveType.enPassant:
        this.handleEnPassant(move);
        break;
      case MoveType.castle:
        this.handleCastle(move);
        break;
    }
  };

  getMovePiece = (move) => {
    if (!move.isPawnPromotion) return move.movePiece;
    return this.activePlayer | PieceType.queen;
  };

  handleEnPassant = (move) => {
    const offset = PieceColor.fromPieceValue(move.movePiece) === PieceColor.white ? -8 : 8;
    const captureSquareIndex = move.toIndex + offset;
    this.squares[captureSquareIndex] = null;
  };

  handleCastle = (move) => {
    const isKingSide = Utils.getFile(move.toIndex) === 6;
    const rookRank = PieceColor.fromPieceValue(move.movePiece) === PieceColor.white ? 0 : 7;
    const rookFile = isKingSide ? 7 : 0;
    const targetFile = isKingSide ? 5 : 3;
    const fromIndex = rookRank * 8 + rookFile;
    const toIndex = rookRank * 8 + targetFile;
    this.squares[toIndex] = this.squares[fromIndex];
    this.squares[fromIndex] = null;
  };

  postMoveActions = (move) => {
    this.setEnPassantTargetSquare(move);
    this.updateCastlingAvailability(move);
    this.setHalfMoveClock(move);
    this.updateFullMoveNumber(move);
    this.togglePlayerTurn();
    this.generateMoves();
  };

  setEnPassantTargetSquare = (move) => {
    const isPawn = PieceType.fromPieceValue(move.movePiece) === PieceType.pawn;
    const distance = Math.abs(move.toIndex - move.fromIndex);
    const color = PieceColor.fromPieceValue(move.movePiece);
    const targetOffset = color === PieceColor.white ? -8 : 8;
    this.enPassantTargetSquare = isPawn && distance === 16
      ? move.toIndex + targetOffset
      : -1;
  };

  updateCastlingAvailability = (move) => {
    if (this.castlingAvailability.length === 0) return;
    const { color, type } = Piece.fromPieceValue(move.movePiece);
    const fromFile = Utils.getFile(move.fromIndex);
    if (type === PieceType.king) {
      this.castlingAvailability = this.castlingAvailability.filter(x => x.color !== color);
    } else if (type === PieceType.rook && [0, 7].includes(fromFile)) {
      const side = fromFile === 0 ? PieceType.queen : PieceType.king;
      this.castlingAvailability = this.castlingAvailability
        .filter(x => x.color !== color || x.type !== side);
    }
  };

  setHalfMoveClock = (move) => {
    const isCapture = !!move.capturePiece;
    const isPawn = PieceType.fromPieceValue(move.movePiece) === PieceType.pawn;
    this.halfMoveClock = isCapture || isPawn ? 0 : this.halfMoveClock + 1;
  };

  updateFullMoveNumber = (move) => {
    if (PieceColor.fromPieceValue(move.movePiece) === PieceColor.black) {
      this.fullMoveNumber++;
    }
  };

  togglePlayerTurn = () => {
    this.activePlayer = this.activePlayer === PieceColor.white
      ? PieceColor.black
      : PieceColor.white;
  };

  generateMoves = () => {
    this.pseudoLegalMoves = this.generatePseudoLegalMoves();
    if (this.preventRecursion) return;
    this.legalMoves = this.generateLegalMoves();
  };

  generatePseudoLegalMoves = () => {
    const moves = [];

    for (let fromIndex = 0; fromIndex < 64; fromIndex++) {
      const pieceValue = this.squares[fromIndex];
      const piece = Piece.fromPieceValue(pieceValue);
      if (!piece) continue;

      switch (piece.type) {
        case PieceType.pawn:
          moves.push(...this.generatePawnMoves(fromIndex, piece));
          break;
        case PieceType.knight:
          moves.push(...this.generateKnightMoves(fromIndex, piece));
          break;
        case PieceType.king:
          moves.push(...this.generateKingMoves(fromIndex, piece));
          break;
        case PieceType.bishop:
        case PieceType.rook:
        case PieceType.queen:
          moves.push(...this.generateSlidingMoves(fromIndex, piece));
          break;
      }
    }

    return moves;
  };

  generateLegalMoves = () => {
    const activePlayerMoves = this.pseudoLegalMoves
      .filter(move => PieceColor.fromPieceValue(move.movePiece) === this.activePlayer);
    if (this.preventRecursion) return activePlayerMoves;
    const fen = Fen.get(this);
    const moves = [];
    activePlayerMoves.forEach(move => {
      const futureGame = new Game({ fen, preventRecursion: true });
      futureGame.doMove(move);
      futureGame.generateMoves();
      const isCheck = futureGame.testForCheck(this.activePlayer);
      if (!isCheck) moves.push(move);
    });
    return moves;
  };

  generatePawnMoves = (fromIndex, piece) => {
    const moves = [];

    const moveForward = piece.color === PieceColor.white ? DirectionIndex.north : DirectionIndex.south;
    const attackLeft = piece.color === PieceColor.white ? DirectionIndex.northWest : DirectionIndex.southEast;
    const attackRight = piece.color === PieceColor.white ? DirectionIndex.northEast : DirectionIndex.southWest;

    // check one square forward
    const forwardSquareIndex = fromIndex + Constants.directionOffsets[moveForward];
    const forwardSquarePiece = this.squares[forwardSquareIndex];
    if (!forwardSquarePiece) {
      moves.push(new Move(fromIndex, forwardSquareIndex, MoveType.advance, this.squares));
    }

    // check two squares forward
    const rank = Math.floor(fromIndex / 8);
    const isFirstMove = (
      (piece.color === PieceColor.white && rank === 1)
      ||
      (piece.color === PieceColor.black && rank === 6)
    );
    if (isFirstMove) {
      const doubleSquareIndex = forwardSquareIndex + Constants.directionOffsets[moveForward];
      const doubleSquarePiece = this.squares[doubleSquareIndex];
      if (!forwardSquarePiece && !doubleSquarePiece) {
        moves.push(new Move(fromIndex, doubleSquareIndex, MoveType.advance, this.squares));
      }
    }

    // check attack left
    const attackLeftSquareIndex = fromIndex + Constants.directionOffsets[attackLeft];
    const attackLeftSquarePiece = this.squares[attackLeftSquareIndex];
    const isAttackLeftOpponent = attackLeftSquarePiece && attackLeftSquarePiece.color !== piece.color;
    if (isAttackLeftOpponent) {
      moves.push(new Move(fromIndex, attackLeftSquareIndex, MoveType.capture, this.squares));
    }

    // check attack right
    const attackRightSquareIndex = fromIndex + Constants.directionOffsets[attackRight];
    const attackRightSquarePiece = this.squares[attackRightSquareIndex];
    const isAttackRightOpponent = attackRightSquarePiece && attackRightSquarePiece.color !== piece.color;
    if (isAttackRightOpponent) {
      moves.push(new Move(fromIndex, attackRightSquareIndex, MoveType.capture, this.squares));
    }

    // check en passant
    if ([attackLeftSquareIndex, attackRightSquareIndex].includes(this.enPassantTargetSquare)) {
      moves.push(new Move(fromIndex, this.enPassantTargetSquare, MoveType.enPassant, this.squares));
    }

    return moves;
  };

  generateKnightMoves = (fromIndex, piece) => {
    const moves = [];

    const checkMove = (passingIndex, dirIndex) => {
      const toIndex = passingIndex + Constants.directionOffsets[dirIndex];
      const toPiece = Piece.fromPieceValue(this.squares[toIndex]);

      // blocked by friendly piece
      if (toPiece && toPiece.color === piece.color) return;

      const moveType = toPiece ? MoveType.capture : MoveType.advance;

      moves.push(new Move(fromIndex, toIndex, moveType, this.squares));
    };

    const northEdge = this.numSquaresToEdge[fromIndex][DirectionIndex.north];
    const southEdge = this.numSquaresToEdge[fromIndex][DirectionIndex.south];
    const westEdge = this.numSquaresToEdge[fromIndex][DirectionIndex.west];
    const eastEdge = this.numSquaresToEdge[fromIndex][DirectionIndex.east];

    if (northEdge > 1) {
      const northIndex = fromIndex + Constants.directionOffsets[DirectionIndex.north];
      if (westEdge > 0) checkMove(northIndex, DirectionIndex.northWest);
      if (eastEdge > 0) checkMove(northIndex, DirectionIndex.northEast);
    }

    if (southEdge > 1) {
      const southIndex = fromIndex + Constants.directionOffsets[DirectionIndex.south];
      if (westEdge > 0) checkMove(southIndex, DirectionIndex.southWest);
      if (eastEdge > 0) checkMove(southIndex, DirectionIndex.southEast);
    }

    if (westEdge > 1) {
      const westIndex = fromIndex + Constants.directionOffsets[DirectionIndex.west];
      if (northEdge > 0) checkMove(westIndex, DirectionIndex.northWest);
      if (southEdge > 0) checkMove(westIndex, DirectionIndex.southWest);
    }

    if (eastEdge > 1) {
      const eastIndex = fromIndex + Constants.directionOffsets[DirectionIndex.east];
      if (northEdge > 0) checkMove(eastIndex, DirectionIndex.northEast);
      if (southEdge > 0) checkMove(eastIndex, DirectionIndex.southEast);
    }

    return moves;
  };

  generateKingMoves = (fromIndex, piece) => {
    const moves = [];

    for (let dirIndex = 0; dirIndex < 8; dirIndex++) {
      const toIndex = fromIndex + Constants.directionOffsets[dirIndex];

      // blocked by edge of board
      if (this.numSquaresToEdge[fromIndex][dirIndex] === 0) continue;

      const toPiece = Piece.fromPieceValue(this.squares[toIndex]);

      // blocked by friendly piece
      if (toPiece && toPiece.color === piece.color) continue;

      const moveType = toPiece ? MoveType.capture : MoveType.advance;

      moves.push(new Move(fromIndex, toIndex, moveType, this.squares));
    }

    // add castling moves
    this.castlingAvailability
      .filter(x => x.color === piece.color)
      .forEach(x => {
        const dirIndex = x.type === PieceType.king ? DirectionIndex.east : DirectionIndex.west;
        const offset = Constants.directionOffsets[dirIndex];
        const passingSquare = this.squares[fromIndex + offset];
        const landingSquare = this.squares[fromIndex + (offset * 2)];
        if (passingSquare || landingSquare) return;
        moves.push(new Move(fromIndex, fromIndex + (offset * 2), MoveType.castle, this.squares));
      });

    return moves;
  };

  generateSlidingMoves = (fromIndex, piece) => {
    const moves = [];

    const startDirIndex = piece.type === PieceType.bishop ? 4 : 0;
    const endDirIndex = piece.type === PieceType.rook ? 4 : 8;

    for (let dirIndex = startDirIndex; dirIndex < endDirIndex; dirIndex++) {
      for (let n = 0; n < this.numSquaresToEdge[fromIndex][dirIndex]; n++) {
        const toIndex = fromIndex + Constants.directionOffsets[dirIndex] * (n + 1);
        const toPiece = Piece.fromPieceValue(this.squares[toIndex]);

        // blocked by friendly piece, so can't move any further in this direction
        if (toPiece && toPiece.color === piece.color) break;

        const moveType = toPiece ? MoveType.capture : MoveType.advance;

        moves.push(new Move(fromIndex, toIndex, moveType, this.squares));

        // can't move any further in this direction after capturing opponent's piece
        if (toPiece && toPiece.color !== piece.color) break;
      }
    }

    return moves;
  };

  testForCheck = (color = this.activePlayer) => {
    const opponentMoves = this.pseudoLegalMoves.filter(move => PieceColor.fromPieceValue(move.movePiece) !== color);
    const opponentCaptures = opponentMoves.filter(move => move.type === MoveType.capture);
    const opponentKingCaptures = opponentCaptures.filter(move => PieceType.fromPieceValue(move.capturePiece) === PieceType.king);
    const isCheck = opponentKingCaptures.length > 0;
    return isCheck;
  };
}
