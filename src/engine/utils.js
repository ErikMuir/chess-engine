const squareSize = 98;
const boardSize = squareSize * 8;
const lightColor = '#f1d9c0';
const darkColor = '#a97a65';
const activeOverlay = '#cccc00';
const previousOverlay = '#cccc00';
const possibleOverlay = '#333333';
const iconColor = '#eeeeee';
const disabledIconColor = '#666666';
const overlayOpacity = 0.4;
const directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
const directionIndex = {
  get north() { return 0; },
  get south() { return 1; },
  get west() { return 2; },
  get east() { return 3; },
  get northWest() { return 4; },
  get southEast() { return 5; },
  get northEast() { return 6; },
  get southWest() { return 7; },
};
const startPosition = 'rnbqkbnr/pppppppp/////PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const scorePattern = /[01]-[01]/;
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: -1000,
  right: -1000,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
};
const modalContentStyle = {
  backgroundColor: 'initial',
  padding: 0,
  maxWidth: '500px',
  borderRadius: '4px',
  overflow: 'hidden',
  boxSizing: 'border-box',
  position: 'relative',
  inset: 0,
  marginLeft: 'auto',
  marginRight: 'auto',
  border: 'none',
  outline: 'none',
};

let numSquaresToEdge;
const getNumSquaresToEdge = () => {
  if (!numSquaresToEdge) {
    numSquaresToEdge = new Array(64);
    for (let file = 0; file < 8; file += 1) {
      for (let rank = 0; rank < 8; rank += 1) {
        const numNorth = 7 - rank;
        const numSouth = rank;
        const numWest = file;
        const numEast = 7 - file;

        const squareIndex = rank * 8 + file;

        numSquaresToEdge[squareIndex] = [
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
  return numSquaresToEdge;
};
const proportion = (ratio) => Math.floor(squareSize * ratio);
const getFile = (index) => index % 8;
const getRank = (index) => Math.floor(index / 8);
const getSquareIndexFromCoordinates = (val) => {
  const file = 'abcdefgh'.indexOf(val[0]);
  const rank = parseInt(val[1], 10) || -1;
  return (file === -1 || rank === -1) ? -1 : rank * 8 + file;
};
const getCoordinatesFromSquareIndex = (index) => {
  const rank = getRank(index);
  const file = getFile(index);
  return `${'abcdefgh'[file]}${rank + 1}`;
};
const getSquareIndexFromEvent = (e) => {
  const rank = 7 - Math.floor(e.offsetY / squareSize);
  const file = Math.floor(e.offsetX / squareSize);
  return rank * 8 + file;
};
const getMovesFromPgn = (pgn) => {
  const moves = [];
  if (!pgn || !pgn.length) return moves;
  for (let i = 0; i < pgn.length; i += 2) {
    const white = pgn[i];
    if (i === pgn.length - 1 && white.match(scorePattern)) {
      moves.push({ score: white });
      break;
    }
    if (i + 1 > pgn.length - 1) {
      moves.push({ white });
      break;
    }
    const black = pgn[i + 1];
    if (i + 1 === pgn.length - 1 && black.match(scorePattern)) {
      moves.push({ white });
      moves.push({ score: black });
      break;
    }
    moves.push({ white, black });
  }
  return moves;
};

const testGames = {
  checkmate: {
    schema: '1.0.0',
    fen: 'rnbqkbnr/pppp1ppp//4p/5PP//PPPPP2P/RNBQKBNR b KQkq g3 0 2',
    pgn: [
      { white: 'f4', black: 'e5' },
      { white: 'g4' },
    ],
  },
  disambiguation: {
    schema: '1.0.0',
    fen: 'q5qk//q1q///P/1PPPPPPP/RNBQKBNR b - - 0 0',
    pgn: [
      { white: 'a3' },
    ],
  },
  promotion: {
    schema: '1.0.0',
    fen: 'k/7P//////K w - - 0 0',
    pgn: [],
  },
};

export {
  squareSize,
  boardSize,
  lightColor,
  darkColor,
  activeOverlay,
  previousOverlay,
  possibleOverlay,
  overlayOpacity,
  iconColor,
  disabledIconColor,
  directionOffsets,
  directionIndex,
  startPosition,
  scorePattern,
  modalOverlayStyle,
  modalContentStyle,
  testGames,
  getNumSquaresToEdge,
  proportion,
  getFile,
  getRank,
  getSquareIndexFromCoordinates,
  getCoordinatesFromSquareIndex,
  getSquareIndexFromEvent,
  getMovesFromPgn,
};
