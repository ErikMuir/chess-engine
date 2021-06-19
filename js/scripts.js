let _game;
let _board;

window.onload = () => {
  _game = new Game({ fen: Constants.startPosition });
  _board = new Board(_game);
  MicroModal.init({
    awaitOpenAnimation: true,
    awaitCloseAnimation: true,
  });
}

/**
 * FEATURES
 * ------------------------------------
 *  determine best move
 * 
 * TECH DEBT
 * ------------------------------------
 *  modularize using babel
 *  unit tests
 * 
 * BUGS
 * ------------------------------------
 */

class Board {
  constructor(game) {
    this.game = game;
    this.squares = new Array(64);

    this.ctx = null;
    this.ppCtx = null;
    this.whitePieceImages = {};
    this.blackPieceImages = {};
    this.activeSquare = null;
    this.possibleSquares = [];
    this.previousMove = {};
    this.dragPiece = null;
    this.deselect = false;
    this.promotionMove = null;
    this.promotionTypes = [
      PieceType.queen,
      PieceType.rook,
      PieceType.bishop,
      PieceType.knight,
    ];

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

    const ppCanvas = document.getElementById('pawn-promotion-canvas');
    ppCanvas.width = Constants.squareSize * 4;
    ppCanvas.height = Constants.squareSize;
    ppCanvas.onmouseup = this.onPawnPromotionChoice;
    this.ppCtx = ppCanvas.getContext('2d');
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
    if (this.game.isGameOver) return;
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

    if (!move) return;

    if (move.isPawnPromotion) {
      this.showPawnPromotionModal(move);
    } else {
      this.doMove(move);
    }
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
    if (this.game.isGameOver) {
      this.showGameOverModal();
    }
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

  showGameOverModal = () => {
    const title = this.game.isCheckmate ? 'Checkmate' : 'Stalemate';
    const message = this.game.isCheckmate ? this.getCheckmateMessage() : this.getStalemateMessage();
    document.getElementById('game-over-modal-title').innerHTML = title;
    document.getElementById('game-over-modal-message').innerHTML = message;
    document.getElementById('game-over-modal-moves').innerHTML = this.game.getPgn();
    MicroModal.show('game-over-modal');
  };

  getCheckmateMessage = () => {
    const winner = PieceColor.toString(PieceColor.opposite(this.game.activePlayer));
    const loser = PieceColor.toString(this.game.activePlayer);
    let moveCount = this.game.fullMoveNumber;
    return `${winner} mated ${loser} in ${moveCount} moves.`;
  };

  getStalemateMessage = () => {
    const activePlayer = PieceColor.toString(this.game.activePlayer);
    return `${activePlayer} is not in check but has no legal moves, therefore it is a draw.`
  };

  showPawnPromotionModal = (move) => {
    this.promotionMove = move;
    const color = this.game.activePlayer;
    const offset = Utils.proportion(0.1);
    const size = Utils.proportion(0.8);
    this.promotionTypes.forEach((type, index) => {
      const piece = new Piece(color, type);
      const img = this.getPieceImage(piece);
      const x = (Constants.squareSize * index) + offset;
      const y = offset;
      this.ppCtx.drawImage(img, x, y, size, size);
    });
    MicroModal.show('pawn-promotion-modal');
  };

  onPawnPromotionChoice = (e) => {
    const index = Math.floor(e.offsetX / Constants.squareSize);
    const move = this.promotionMove;
    move.pawnPromotionType = this.promotionTypes[index];
    MicroModal.close('pawn-promotion-modal');
    this.doMove(move);
    this.promotionMove = null;
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
  get coordinates() { return `${'abcdefgh'[this.file]}${this.rank + 1}`; }

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
    this.moveHistory = [];
    this.pgnParts = [];

    this.preventRecursion = preventRecursion;
    FEN.load(fen, this);
    this.init();
    this.generateMoves();
  }

  get isGameOver() { return this.legalMoves.length === 0; }

  get isCheck() {
    const king = this.activePlayer | PieceType.king;
    return this.pseudoLegalMoves.some(move => move.capturePiece === king)
  }

  get isCheckmate() { return this.isGameOver && this.isCheck; }

  getPgn = () => this.pgnParts.join(' ');

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
    if (!move.isPawnPromotion) return move.piece;
    return this.activePlayer | move.pawnPromotionType;
  };

  handleEnPassant = (move) => {
    const offset = PieceColor.fromPieceValue(move.piece) === PieceColor.white ? -8 : 8;
    const captureSquareIndex = move.toIndex + offset;
    this.squares[captureSquareIndex] = null;
  };

  handleCastle = (move) => {
    const isKingSide = Utils.getFile(move.toIndex) === 6;
    const rookRank = PieceColor.fromPieceValue(move.piece) === PieceColor.white ? 0 : 7;
    const rookFile = isKingSide ? 7 : 0;
    const targetFile = isKingSide ? 5 : 3;
    const fromIndex = rookRank * 8 + rookFile;
    const toIndex = rookRank * 8 + targetFile;
    this.squares[toIndex] = this.squares[fromIndex];
    this.squares[fromIndex] = null;
  };

  postMoveActions = (move) => {
    const legalMoves = [...this.legalMoves];
    this.setEnPassantTargetSquare(move);
    this.updateCastlingAvailability(move);
    this.setHalfMoveClock(move);
    this.togglePlayerTurn();
    this.generateMoves();
    if (!this.isGameOver) {
      this.updateFullMoveNumber(move);
    }
    this.updateMove(move);
    this.appendToPgn(move, legalMoves);
    this.archiveMove(move);
  };

  setEnPassantTargetSquare = (move) => {
    const isPawn = PieceType.fromPieceValue(move.piece) === PieceType.pawn;
    const distance = Math.abs(move.toIndex - move.fromIndex);
    const color = PieceColor.fromPieceValue(move.piece);
    const targetOffset = color === PieceColor.white ? -8 : 8;
    this.enPassantTargetSquare = isPawn && distance === 16
      ? move.toIndex + targetOffset
      : -1;
  };

  updateCastlingAvailability = (move) => {
    if (this.castlingAvailability.length === 0) return;
    const { color, type } = Piece.fromPieceValue(move.piece);
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
    const isPawn = PieceType.fromPieceValue(move.piece) === PieceType.pawn;
    this.halfMoveClock = isCapture || isPawn ? 0 : this.halfMoveClock + 1;
  };

  togglePlayerTurn = () => {
    this.activePlayer = this.activePlayer === PieceColor.white
      ? PieceColor.black
      : PieceColor.white;
  };

  updateFullMoveNumber = (move) => {
    if (PieceColor.fromPieceValue(move.piece) === PieceColor.black) {
      this.fullMoveNumber++;
    }
  };

  updateMove = (move) => {
    move.isCheck = this.isCheck;
    move.isCheckmate = this.isCheckmate;
  };

  archiveMove = (move) => {
    this.moveHistory.push(move);
  }

  appendToPgn = (move, legalMoves) => {
    if (PieceColor.fromPieceValue(move.piece) === PieceColor.white) {
      this.pgnParts.push(`${this.fullMoveNumber}.`);
    }
    this.pgnParts.push(PGN.get(move, legalMoves));
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
      .filter(move => PieceColor.fromPieceValue(move.piece) === this.activePlayer);
    if (this.preventRecursion) return activePlayerMoves;
    const fen = FEN.get(this);
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
      moves.push(new Move(MoveType.normal, fromIndex, forwardSquareIndex, this.squares));
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
        moves.push(new Move(MoveType.normal, fromIndex, doubleSquareIndex, this.squares));
      }
    }

    // check attack left
    const attackLeftSquareIndex = fromIndex + Constants.directionOffsets[attackLeft];
    const attackLeftSquarePiece = this.squares[attackLeftSquareIndex];
    const isAttackLeftOpponent = attackLeftSquarePiece && attackLeftSquarePiece.color !== piece.color;
    if (isAttackLeftOpponent) {
      moves.push(new Move(MoveType.capture, fromIndex, attackLeftSquareIndex, this.squares));
    }

    // check attack right
    const attackRightSquareIndex = fromIndex + Constants.directionOffsets[attackRight];
    const attackRightSquarePiece = this.squares[attackRightSquareIndex];
    const isAttackRightOpponent = attackRightSquarePiece && attackRightSquarePiece.color !== piece.color;
    if (isAttackRightOpponent) {
      moves.push(new Move(MoveType.capture, fromIndex, attackRightSquareIndex, this.squares));
    }

    // check en passant
    if ([attackLeftSquareIndex, attackRightSquareIndex].includes(this.enPassantTargetSquare)) {
      moves.push(new Move(MoveType.enPassant, fromIndex, this.enPassantTargetSquare, this.squares));
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

      const moveType = toPiece ? MoveType.capture : MoveType.normal;

      moves.push(new Move(moveType, fromIndex, toIndex, this.squares));
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

      const moveType = toPiece ? MoveType.capture : MoveType.normal;

      moves.push(new Move(moveType, fromIndex, toIndex, this.squares));
    }

    // add castling moves
    this.castlingAvailability
      .filter(x => x.color === piece.color)
      .forEach(x => {
        const dirIndex = x.type === PieceType.king ? DirectionIndex.east : DirectionIndex.west;
        const offset = Constants.directionOffsets[dirIndex];
        const passingSquarePiece = this.squares[fromIndex + offset];
        const landingSquareIndex = fromIndex + (offset * 2);
        const landingSquarePiece = this.squares[landingSquareIndex];
        if (passingSquarePiece || landingSquarePiece) return;
        const moveType = x.type === PieceType.king ? MoveType.kingSideCastle : MoveType.queenSideCastle;
        moves.push(new Move(moveType, fromIndex, landingSquareIndex, this.squares));
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

        const moveType = toPiece ? MoveType.capture : MoveType.normal;

        moves.push(new Move(moveType, fromIndex, toIndex, this.squares));

        // can't move any further in this direction after capturing opponent's piece
        if (toPiece && toPiece.color !== piece.color) break;
      }
    }

    return moves;
  };

  testForCheck = (color = this.activePlayer) => {
    const king = color | PieceType.king;
    return this.pseudoLegalMoves.some(move => move.capturePiece === king);
    // const opponentMoves = this.pseudoLegalMoves.filter(move => PieceColor.fromPieceValue(move.piece) !== color);
    // const opponentCaptures = opponentMoves.filter(move => move.type === MoveType.capture);
    // const opponentKingCaptures = opponentCaptures.filter(move => PieceType.fromPieceValue(move.capturePiece) === PieceType.king);
    // const isCheck = opponentKingCaptures.length > 0;
    // return isCheck;
  };
}
