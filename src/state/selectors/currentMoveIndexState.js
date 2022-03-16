import { selector } from 'recoil';
import gameState from '../atoms/gameState';

const currentMoveIndexState = selector({
  key: 'currentMoveIndexState',
  get: ({ get }) => {
    const game = get(gameState);
    return game.currentMoveIndex;
  },
});

export default currentMoveIndexState;
