import React from 'react';
import Controls from './Controls';
import Board from './Board';
import MoveList from './MoveList';

const Main = ({ game, updateGame }) => (
  <main className="app-main">
    <Controls game={game} />
    <Board game={game} updateGame={updateGame} />
    <MoveList game={game} />
  </main>
);

export default Main;
