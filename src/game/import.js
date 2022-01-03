import FEN from './FEN';
import Game from './Game';

const importGameFromJson = ({
  playerColor,
  fen,
  moves,
  pgn,
}) => {
  if (!moves || !moves.length) {
    return new Game({ playerColor, fen });
  }

  const game = new Game({ playerColor });
  moves.forEach(game.doMove);

  if (fen !== FEN.get(game)) {
    throw new Error('Invalid game json');
  }

  if (pgn && pgn.length) {
    const lastPgn = pgn[pgn.length - 1];
    if (lastPgn.includes('resign')) game.isResignation = true;
    if (lastPgn.includes('draw')) game.isDraw = true;
  }

  return game;
};

export { importGameFromJson };
