import React from 'react';
import Board from './Board';
import MoveList from './MoveList';

const Main = ({ game, updateGame }) => (
  <main className="app-main">
    <div className="aside" />
    <Board game={game} updateGame={updateGame} />
    <MoveList game={game} />
  </main>
);

export default Main;
