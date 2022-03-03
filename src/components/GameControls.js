import React from 'react';
import Icon from '@mdi/react';
import {
  mdiFlag,
  mdiNewBox,
  mdiImport,
  mdiTrayArrowDown,
  mdiCheckCircle,
  mdiCheckCircleOutline,
  mdiLightbulbOn,
} from '@mdi/js';
import { boardSize, iconColor, disabledIconColor } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('Controls');
const loadGameInputId = 'load-game-input';

const GameControls = (props) => {
  logger.trace('render');

  const {
    importGame,
    newGame,
    exportGame,
    resign,
    getHint,
    toggleConfirmation,
    confirmationDisabled,
    isGameOver,
  } = props;

  const fileReader = new FileReader();
  fileReader.onerror = () => logger.error(fileReader.error);
  fileReader.onload = () => {
    logger.trace('fileReaderOnLoad');
    try {
      const gameJson = JSON.parse(fileReader.result);
      importGame(gameJson);
    } catch (err) {
      logger.error('Error loading game', err);
      // TODO : inform user
    }
  };

  const toggleConfirmationIcon = confirmationDisabled ? mdiCheckCircleOutline : mdiCheckCircle;
  const toggleConfirmationText = confirmationDisabled ? 'Enable move confirmation' : 'Disable move confirmation';

  const readFile = () => {
    logger.trace('readFile');
    const loadGameInput = document.getElementById(loadGameInputId);
    const file = loadGameInput.files[0];
    if (file) fileReader.readAsText(file);
  };

  const handleNew = (e) => {
    logger.trace('handleNew');
    newGame();
    e.currentTarget.blur();
  };

  const handleImport = (e) => {
    logger.trace('handleImport');
    const loadGameInput = document.getElementById(loadGameInputId);
    loadGameInput.value = '';
    loadGameInput.click();
    e.currentTarget.blur();
  };

  const handleExport = (e) => {
    logger.trace('handleExport');
    exportGame();
    e.currentTarget.blur();
  };

  const handleResign = (e) => {
    logger.trace('handleResign');
    resign();
    e.currentTarget.blur();
  };

  const handleHint = (e) => {
    logger.trace('handleHint');
    getHint();
    e.currentTarget.blur();
  };

  const handleToggleConfirmation = (e) => {
    logger.trace('handleToggleConfirmation');
    toggleConfirmation();
    e.currentTarget.blur();
  };

  return (
    <div className="aside game-controls" style={{ height: boardSize }}>
      <div>
        <button type="button" onClick={handleNew} title="New game">
          <Icon path={mdiNewBox} size={1.5} color={iconColor} />
        </button>
      </div>
      <div>
        <button type="button" onClick={handleImport} title="Import">
          <Icon path={mdiImport} size={1.5} color={iconColor} />
        </button>
      </div>
      <div>
        <button type="button" onClick={handleExport} title="Export">
          <Icon path={mdiTrayArrowDown} size={1.5} color={iconColor} />
        </button>
      </div>
      <div>
        <button type="button" onClick={handleResign} title="Resign" disabled={isGameOver}>
          <Icon path={mdiFlag} size={1.5} color={isGameOver ? disabledIconColor : iconColor} />
        </button>
      </div>
      <div>
        <button type="button" onClick={handleHint} title="Hint" disabled={isGameOver}>
          <Icon path={mdiLightbulbOn} size={1.5} color={isGameOver ? disabledIconColor : iconColor} />
        </button>
      </div>
      <div>
        <button type="button" onClick={handleToggleConfirmation} title={toggleConfirmationText}>
          <Icon path={toggleConfirmationIcon} size={1.5} color={iconColor} />
        </button>
      </div>
      <input type="file" id={loadGameInputId} onChange={readFile} accept="application/json" />
    </div>
  );
};

export default GameControls;
