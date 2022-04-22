// eslint-disable-next-line import/no-cycle
import { Game, Move } from '.';
import Logger from '../Logger';

const log = new Logger('import');

const importGameFromJson = ({
  playerColor,
  fen,
  moves,
  pgn,
}) => {
  if (!moves || !moves.length) {
    log.info('No moves provided. Using fen as starting position.');
    return new Game({ playerColor, fen });
  }

  const game = new Game({ playerColor });
  moves.forEach((move) => {
    const newMove = Move.clone(move);
    game.doMove(newMove);
  });

  const resultingGameFen = game.fen;
  if (fen !== resultingGameFen) {
    log.error('mismatched FENs', { fen, resultingGameFen });
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
