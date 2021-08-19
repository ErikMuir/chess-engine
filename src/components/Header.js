import React from 'react';
import Menu from './Menu';
import Logger from '../Logger';

const logger = new Logger('Header');

const Header = () => {
  logger.trace('render');
  return (
    <header className="app-header">
      <div>
        <Menu />
      </div>
    </header>
  );
};

export default Header;
