import { atom } from 'recoil';

const computerMoveState = atom({
  key: 'computerMoveState',
  default: false,
});

export default computerMoveState;
