import { selector } from 'recoil';
import gameState from '../atoms/gameState';

const fenHistoryState = selector({
  key: 'fenHistoryState',
  get: ({ get }) => {
    const game = get(gameState);
    return game.fenHistory;
  },
});

export default fenHistoryState;
