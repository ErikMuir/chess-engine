import { atom } from 'recoil';

const previousSquaresState = atom({
  key: 'previousSquaresState',
  default: [],
});

export default previousSquaresState;
