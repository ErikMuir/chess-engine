# chess-engine

A javascript chess engine with React GUI

## Upcoming Features

- new game - choose white or black
- analysis
- hint
- play vs computer
  - add 1 level of depth
    - ~~capture the piece with highest value~~
    - make move with highest trade differential
  - add basic strategy
    - control center squares
    - castle as soon as possible
    - avoid double pawns
    - connected rooks
    - align rooks on open files
  - add more levels of depth
  - add advanced strategy
- responsive design for mobile support

## Tech Debt

- unit tests
- consider redux or some other state management system?

## Known Bugs

<!-- - _none_ -->
- captured pieces momentarily overlap
- captured pieces don't change when navigating move history
- legal moves sometimes get screwed up (can't replicate)

## Attributions

- Chess Pieces: `en:User:Cburnett, CC BY-SA 3.0 <http://creativecommons.org/licenses/by-sa/3.0/>, via Wikimedia Commons`
