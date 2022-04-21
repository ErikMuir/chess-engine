import { atom } from 'recoil';

const squaresState = atom({
  key: 'squaresState',
  default: [],
});

export default squaresState;
