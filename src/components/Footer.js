import React from 'react';
import {
  // mdiWeb,
  mdiEmail,
  mdiGithub,
} from '@mdi/js';
import Icon from '@mdi/react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const copyright = `Copyright © ${currentYear} Erik Muir`;
  return (
    <footer className="app-footer">
      <div>
        <span className="copyright">{copyright}</span>
        <a href="mailto:erik@muirdev.com">
          <Icon path={mdiEmail} size={0.7} color="rgb(89, 89, 89)" />
        </a>
        {/* <a href="http://muirdev.com" target="_blank" rel="noreferrer">
          <Icon path={mdiWeb} size={0.7} color="rgb(89, 89, 89)" />
        </a> */}
        <a href="https://github.com/ErikMuir/chess-engine" target="_blank" rel="noreferrer">
          <Icon path={mdiGithub} size={0.7} color="rgb(89, 89, 89)" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
