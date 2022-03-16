import { selector } from 'recoil';
import gameState from '../atoms/gameState';

const activePlayer = selector({
  key: 'activePlayer',
  get: ({ get }) => {
    const game = get(gameState);
    return game.activePlayer;
  },
});

export default activePlayer;
