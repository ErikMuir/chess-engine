import React from 'react';
import { useRecoilValue } from 'recoil';
import Icon from '@mdi/react';
import {
  mdiFlag,
  mdiNewBox,
  mdiImport,
  mdiTrayArrowDown,
  mdiCheckCircle,
  mdiCheckCircleOutline,
  mdiLightbulbOn,
  mdiInformation,
} from '@mdi/js';
import confirmationDisabledState from '../state/atoms/confirmationDisabledState';
import gameOverState from '../state/selectors/gameOverState';
import { boardSize, iconColor, disabledIconColor } from '../engine/utils';
import Logger from '../Logger';

const log = new Logger('Controls');
const loadGameInputId = 'load-game-input';

const GameControls = ({
  importGame,
  newGame,
  exportGame,
  resign,
  getHint,
  toggleConfirmation,
  showInformation,
}) => {
  const isGameOver = useRecoilValue(gameOverState);
  const isConfirmationDisabled = useRecoilValue(confirmationDisabledState);

  const fileReader = new FileReader();
  fileReader.onerror = () => log.error(fileReader.error);
  fileReader.onload = () => {
    try {
      const gameJson = JSON.parse(fileReader.result);
      importGame(gameJson);
    } catch (err) {
      log.error('Error loading game', err);
      // TODO : inform user
    }
  };

  const toggleConfirmationIcon = isConfirmationDisabled ? mdiCheckCircleOutline : mdiCheckCircle;
  const toggleConfirmationText = isConfirmationDisabled ? 'Enable move confirmation' : 'Disable move confirmation';

  const readFile = () => {
    const loadGameInput = document.getElementById(loadGameInputId);
    const file = loadGameInput.files[0];
    if (file) fileReader.readAsText(file);
  };

  const handleNew = (e) => {
    newGame();
    e.currentTarget.blur();
  };

  const handleImport = (e) => {
    const loadGameInput = document.getElementById(loadGameInputId);
    loadGameInput.value = '';
    loadGameInput.click();
    e.currentTarget.blur();
  };

  const handleExport = (e) => {
    exportGame();
    e.currentTarget.blur();
  };

  const handleResign = (e) => {
    resign();
    e.currentTarget.blur();
  };

  const handleHint = (e) => {
    getHint();
    e.currentTarget.blur();
  };

  const handleToggleConfirmation = (e) => {
    toggleConfirmation();
    e.currentTarget.blur();
  };

  const handleInformation = (e) => {
    showInformation();
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
      <div>
        <button type="button" onClick={handleInformation} title="Information">
          <Icon path={mdiInformation} size={1.5} color={iconColor} />
        </button>
      </div>
      <input type="file" id={loadGameInputId} onChange={readFile} accept="application/json" />
    </div>
  );
};

export default GameControls;
