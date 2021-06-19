class MoveType {
  static normal = 0;

  static capture = 1;

  static kingSideCastle = 2;

  static queenSideCastle = 3;

  static enPassant = 4;

  static captureMoves = [
    MoveType.capture,
    MoveType.enPassant,
  ];
}

export default MoveType;
