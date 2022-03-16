import { atom } from 'recoil';

const confirmationDisabledState = atom({
  key: 'confirmationDisabledState',
  default: false,
});

export default confirmationDisabledState;
