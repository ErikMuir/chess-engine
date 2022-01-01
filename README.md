# chess-engine

A javascript chess engine with React chess GUI

## Upcoming Features

- move list indicates when game ends in draw
- new game - choose white or black
- analysis
- hint
- play vs computer
  - add 1 level of depth
  - add basic strategy
  - add multiple levels of depth
  - add advanced strategy
- responsive design for mobile support

## Tech Debt

- unit tests
- consider redux or some other state management system?
- refactor Board.previousSquares to Game.previousMove (and get rid of moveHistory)
- refactor Game.pgn to be a straight array of pgn stringsinstead of object with white/black/score

## Known Bugs

<!-- - _none_ -->
- imported games don't allow move navigation

## Attributions

- Chess Pieces: `en:User:Cburnett, CC BY-SA 3.0 <http://creativecommons.org/licenses/by-sa/3.0/>, via Wikimedia Commons`
