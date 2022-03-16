import { atom } from 'recoil';

const dragPieceState = atom({
  key: 'dragPieceState',
  default: null,
});

export default dragPieceState;
