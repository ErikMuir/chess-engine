import { squareSize } from './constants';

const isDigit = (str) => /^\d+$/.test(str);
const proportion = (ratio) => Math.floor(squareSize * ratio);
const getFile = (index) => index % 8;
const getRank = (index) => Math.floor(index / 8);
const getSquareIndexFromCoordinates = (val) => {
  try {
    const file = 'abcdefgh'.indexOf(val[0]);
    const rank = parseInt(val[1], 10) || -1;
    return (file === -1 || rank === -1) ? -1 : rank * 8 + file;
  } catch {
    return -1;
  }
};
const getCoordinatesFromSquareIndex = (index) => {
  const rank = getRank(index);
  const file = getFile(index);
  return `${'abcdefgh'[file]}${rank + 1}`;
};

export {
  isDigit,
  proportion,
  getFile,
  getRank,
  getSquareIndexFromCoordinates,
  getCoordinatesFromSquareIndex,
};
