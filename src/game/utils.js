const squareSize = 98;
const boardSize = squareSize * 8;
const lightColor = '#f1d9c0';
const darkColor = '#a97a65';
const activeOverlay = '#cccc00';
const previousOverlay = '#cccc00';
const possibleOverlay = '#333333';
const iconColor = '#eeeeee';
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
const getMovesFromPgn = (pgn) => {
  const moves = [];
  const scorePattern = /[01]-[01]/;
  for (let i = 0; i < pgn.length; i += 2) {
    if (i % 2 === 0) {
      const pgnMove = {};
      const white = pgn[i];
      const black = pgn[i + 1];
      if (white.match(scorePattern)) {
        pgnMove.score = white;
      } else {
        pgnMove.white = white;
      }
      if (black) {
        if (black.match(scorePattern)) {
          pgnMove.score = black;
        } else {
          pgnMove.black = black;
        }
      }
      moves.push(pgnMove);
    }
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
  directionOffsets,
  directionIndex,
  startPosition,
  testGames,
  getNumSquaresToEdge,
  proportion,
  getFile,
  getRank,
  getSquareIndexFromCoordinates,
  getCoordinatesFromSquareIndex,
  getMovesFromPgn,
};
