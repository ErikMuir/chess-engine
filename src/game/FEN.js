import Piece from './Piece';
import PieceColor from './PieceColor';
import PieceType from './PieceType';
import {
  isDigit,
  getSquareIndexFromCoordinates,
  getCoordinatesFromSquareIndex,
} from './utils';
import Logger from '../utils/Logger';

const logger = new Logger('FEN');

class FEN {
  static load = (fen, game) => {
    logger.trace('FEN.load');
    try {
      const fenParts = fen.split(' ');
      FEN.parsePiecePlacement(fenParts[0], game);
      FEN.parseActivePlayer(fenParts[1], game);
      FEN.parseCastlingAvailability(fenParts[2], game);
      FEN.parseEnPassantTargetSquare(fenParts[3], game);
      FEN.parseHalfMoveClock(fenParts[4], game);
      FEN.parseFullMoveNumber(fenParts[5], game);
    } catch (e) {
      throw new Error('Invalid FEN');
    }
  };

  static get = (game) => {
    logger.trace('FEN.get');
    const fenParts = [
      FEN.getPiecePlacement(game),
      FEN.getActivePlayer(game),
      FEN.getCastlingAvailability(game),
      FEN.getEnPassantTargetSquare(game),
      FEN.getHalfMoveClock(game),
      FEN.getFullMoveNumber(game),
    ];
    return fenParts.join(' ');
  };

  static parsePiecePlacement = (val, game) => {
    logger.trace('FEN.parsePiecePlacement');
    let file = 0;
    let rank = 7;
    val.split('').forEach((symbol) => {
      if (symbol === '/') {
        file = 0;
        rank -= 1;
      } else if (isDigit(symbol)) {
        file += parseInt(symbol, 10);
      } else {
        game.squares[rank * 8 + file] = Piece.fromFEN(symbol).value;
        file += 1;
      }
    });
  };

  static getPiecePlacement = (game) => {
    logger.trace('FEN.getPiecePlacement');
    let output = '';
    for (let rank = 7; rank >= 0; rank -= 1) {
      output += FEN.getFenByRank(rank, game);
      if (rank > 0) output += '/';
    }
    return output;
  };

  static getFenByRank = (rank, game) => {
    logger.trace('FEN.getFenByRank');
    let output = '';
    let consecutiveEmptySquares = 0;
    for (let file = 0; file < 8; file += 1) {
      const pieceValue = game.squares[rank * 8 + file];
      if (!pieceValue) {
        consecutiveEmptySquares += 1;
      } else {
        if (consecutiveEmptySquares > 0) {
          output += `${consecutiveEmptySquares}`;
        }
        consecutiveEmptySquares = 0;
        const piece = Piece.fromPieceValue(pieceValue);
        output += Piece.toString(piece);
      }
    }
    return output;
  };

  static parseActivePlayer = (val, game) => {
    logger.trace('FEN.parseActivePlayer');
    switch (val.toLowerCase()) {
      case 'w': game.activePlayer = PieceColor.white; break;
      case 'b': game.activePlayer = PieceColor.black; break;
      default: game.activePlayer = PieceColor.none; break;
    }
  };

  static getActivePlayer = (game) => {
    logger.trace('FEN.getActivePlayer');
    switch (game.activePlayer) {
      case PieceColor.white: return 'w';
      case PieceColor.black: return 'b';
      default: return '-';
    }
  };

  static parseCastlingAvailability = (val, game) => {
    logger.trace('FEN.parseCastlingAvailability');
    game.castlingAvailability = [];
    if (val.indexOf('K') > -1) game.castlingAvailability.push(new Piece(PieceColor.white, PieceType.king));
    if (val.indexOf('Q') > -1) game.castlingAvailability.push(new Piece(PieceColor.white, PieceType.queen));
    if (val.indexOf('k') > -1) game.castlingAvailability.push(new Piece(PieceColor.black, PieceType.king));
    if (val.indexOf('q') > -1) game.castlingAvailability.push(new Piece(PieceColor.black, PieceType.queen));
  };

  static getCastlingAvailability = (game) => {
    logger.trace('FEN.getCastlingAvailability');
    if (game.castlingAvailability.length === 0) return '-';
    return game.castlingAvailability.map((x) => Piece.toString(x)).join('');
  };

  static parseEnPassantTargetSquare = (val, game) => {
    logger.trace('FEN.parseEnPassantTargetSquare');
    game.enPassantTargetSquare = val === '-' ? -1 : getSquareIndexFromCoordinates(val);
  };

  static getEnPassantTargetSquare = (game) => {
    logger.trace('FEN.getEnPassantTargetSquare');
    return (game.enPassantTargetSquare === -1
      ? '-'
      : getCoordinatesFromSquareIndex(game.enPassantTargetSquare));
  }

  static parseHalfMoveClock = (val, game) => {
    logger.trace('FEN.parseHalfMoveClock');
    game.halfMoveClock = parseInt(val, 10) || 0;
  };

  static getHalfMoveClock = (game) => {
    logger.trace('FEN.getHalfMoveClock');
    return `${game.halfMoveClock}`;
  }

  static parseFullMoveNumber = (val, game) => {
    logger.trace('FEN.parseFullMoveNumber');
    game.fullMoveNumber = parseInt(val, 10) || 1;
  };

  static getFullMoveNumber = (game) => {
    logger.trace('FEN.getFullMoveNumber');
    return `${game.fullMoveNumber}`;
  }
}

export default FEN;
