const squareSize = 80;
const boardSize = squareSize * 8;
const lightColor = '#f1d9c0';
const darkColor = '#a97a65';
const activeOverlay = '#cccc00';
const previousOverlay = '#cccc00';
const possibleOverlay = '#333333';
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
const testFEN = {
  promotion: 'k/7P//////K w - - 0 0',
  checkmate: 'rnbqkbnr/pppp1ppp//4p/5PP//PPPPP2P/RNBQKBNR b KQkq g3 0 2',
  disambiguation: 'q5qk//q1q////PPPPPPPP/RNBQKBNR b - - 0 0',
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

export {
  squareSize,
  boardSize,
  lightColor,
  darkColor,
  activeOverlay,
  previousOverlay,
  possibleOverlay,
  overlayOpacity,
  directionOffsets,
  directionIndex,
  startPosition,
  testFEN,
  proportion,
  getFile,
  getRank,
  getSquareIndexFromCoordinates,
  getCoordinatesFromSquareIndex,
};
