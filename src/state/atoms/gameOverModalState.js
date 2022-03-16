import { atom } from 'recoil';

const gameOverModalState = atom({
  key: 'gameOverModalState',
  default: false,
});

export default gameOverModalState;
