import FEN from './FEN';
import Game from './Game';
import Logger from '../Logger';

const logger = new Logger('import');

const importGameFromJson = ({
  playerColor,
  fen,
  moves,
  pgn,
}) => {
  if (!moves || !moves.length) {
    logger.trace('No moves provided. Using fen as starting position.');
    return new Game({ playerColor, fen });
  }

  const game = new Game({ playerColor });
  moves.forEach(game.doMove);

  const resultingGameFen = FEN.get(game);
  if (fen !== resultingGameFen) {
    logger.trace('mismatched FENs', { fen, resultingGameFen });
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
