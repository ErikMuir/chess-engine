import { atom } from 'recoil';

const squaresState = atom({
  key: 'squaresState',
  default: [],
  // effects: [
  //   ({ onSet }) => {
  //     onSet((newSquares) => {
  //       console.log('squaresState.onSet:', newSquares);
  //     });
  //   },
  // ],
});

export default squaresState;
