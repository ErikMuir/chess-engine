import { atom } from 'recoil';

const possibleSquaresState = atom({
  key: 'possibleSquaresState',
  default: [],
});

export default possibleSquaresState;
