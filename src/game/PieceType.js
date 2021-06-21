class PieceType {
  static none = 0;

  static king = 1;

  static pawn = 2;

  static knight = 3;

  static bishop = 4;

  static rook = 5;

  static queen = 6;

  static allTypes = [
    PieceType.king,
    PieceType.queen,
    PieceType.rook,
    PieceType.bishop,
    PieceType.knight,
    PieceType.pawn,
  ];

  static ambiguousTypes = [
    PieceType.knight,
    PieceType.bishop,
    PieceType.rook,
    PieceType.queen,
  ];

  static fromPieceValue = (val) => {
    switch (val % 8) {
      case 1: return PieceType.king;
      case 2: return PieceType.pawn;
      case 3: return PieceType.knight;
      case 4: return PieceType.bishop;
      case 5: return PieceType.rook;
      case 6: return PieceType.queen;
      default: return PieceType.none;
    }
  };

  static fromFEN = (val) => {
    switch (val.toUpperCase()) {
      case 'K': return PieceType.king;
      case 'P': return PieceType.pawn;
      case 'N': return PieceType.knight;
      case 'B': return PieceType.bishop;
      case 'R': return PieceType.rook;
      case 'Q': return PieceType.queen;
      default: return PieceType.none;
    }
  };

  static toString = (val) => {
    switch (val) {
      case PieceType.king: return 'K';
      case PieceType.pawn: return 'P';
      case PieceType.knight: return 'N';
      case PieceType.bishop: return 'B';
      case PieceType.rook: return 'R';
      case PieceType.queen: return 'Q';
      default: return '';
    }
  };
}

export default PieceType;
