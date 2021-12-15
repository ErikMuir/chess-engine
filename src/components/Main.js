import React from 'react';
import Controls from './Controls';
import Board from './Board';
import MoveList from './MoveList';

const Main = (props) => {
  const {
    game,
    updateApp,
    newGame,
    importGame,
    exportGame,
    resign,
  } = props;

  return (
    <main className="app-main">
      <Controls
        newGame={newGame}
        importGame={importGame}
        exportGame={exportGame}
        resign={resign}
      />
      <Board game={game} updateApp={updateApp} />
      <MoveList game={game} />
    </main>
  );
};

export default Main;
