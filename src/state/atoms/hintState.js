import { atom } from 'recoil';

const hintState = atom({
  key: 'hintState',
  default: null,
});

export default hintState;
