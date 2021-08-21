import React from 'react';
import Menu from './Menu';
import Logger from '../Logger';

const logger = new Logger('Header');

const Header = (props) => {
  logger.trace('render');
  const { newGame, loadGame, saveGame } = props;
  return (
    <header className="app-header">
      <div>
        <Menu
          newGame={newGame}
          loadGame={loadGame}
          saveGame={saveGame}
        />
      </div>
    </header>
  );
};

export default Header;
