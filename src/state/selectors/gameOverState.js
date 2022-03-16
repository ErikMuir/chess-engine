import { selector } from 'recoil';
import gameState from '../atoms/gameState';

const gameOverState = selector({
  key: 'gameOverState',
  get: ({ get }) => {
    const game = get(gameState);
    return game.isGameOver;
  },
});

export default gameOverState;
