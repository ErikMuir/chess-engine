import Game from './Game';
import Logger from '../Logger';
import Move from './Move';

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
  moves.forEach(({
    type,
    fromIndex,
    toIndex,
    piece,
    capturePiece,
    isCheck,
    isCheckmate,
    pawnPromotionType,
  }) => {
    const move = new Move(type, fromIndex, toIndex, []);
    move.piece = piece;
    move.capturePiece = capturePiece;
    move.isCheck = isCheck;
    move.isCheckmate = isCheckmate;
    move.pawnPromotionType = pawnPromotionType;
    game.doMove(move);
  });

  const resultingGameFen = game.fen;
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
