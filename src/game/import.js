import Game from './Game';
import { scorePattern } from './utils';

const importGameFromJson = ({ pgn, playerColor }) => {
  const game = new Game({ playerColor });

  function parseMove(moveSymbol) {
    // TODO : parse move
  }

  for (let i = 0; i < pgn.length; i += 1) {
    const moveSymbol = pgn[i];
    if (moveSymbol.match(scorePattern)) {
      if (moveSymbol.includes('resign')) game.isResignation = true;
      if (moveSymbol.includes('draw')) game.isDraw = true;
      return game;
    }
    const move = parseMove(moveSymbol);
    game.doMove(move);
  }

  return game;
};

export { importGameFromJson };
