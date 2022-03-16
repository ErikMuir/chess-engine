import { atom } from 'recoil';
import Game from '../../engine/Game';

const gameState = atom({
  key: 'gameState',
  default: new Game(),
});

export default gameState;
