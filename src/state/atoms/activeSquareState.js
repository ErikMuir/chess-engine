import { atom } from 'recoil';

const activeSquareState = atom({
  key: 'activeSquareState',
  default: null,
});

export default activeSquareState;
