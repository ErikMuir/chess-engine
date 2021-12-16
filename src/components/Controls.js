import React from 'react';
import Icon from '@mdi/react';
import {
  mdiFlag,
  mdiNewBox,
  mdiImport,
  mdiTrayArrowDown,
} from '@mdi/js';
import { standardizeGameJson } from '../game/schemaHelpers';
import { boardSize } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('Controls');
const loadGameInputId = 'load-game-input';

class Controls extends React.Component {
  constructor(props) {
    super(props);
    logger.trace('ctor');
    this.fileReader = new FileReader();
    this.fileReader.onerror = () => logger.error(this.fileReader.error);
    this.fileReader.onload = () => this.fileReaderOnLoad(this.fileReader.result);
  }

  readFile = () => {
    logger.trace('readFile');
    const loadGameInput = document.getElementById(loadGameInputId);
    const file = loadGameInput.files[0];
    this.fileReader.readAsText(file);
  };

  fileReaderOnLoad = (readerResult) => {
    logger.trace('fileReaderOnLoad');
    try {
      const gameJson = JSON.parse(readerResult);
      const standardizedGameJson = standardizeGameJson(gameJson);
      const { importGame } = this.props;
      importGame(standardizedGameJson);
    } catch (err) {
      logger.error('Error loading game', err);
      // TODO : inform user
    }
  };

  handleNew = (e) => {
    logger.trace('handleNew');
    const { newGame } = this.props;
    newGame();
    e.currentTarget.blur();
  };

  handleImport = (e) => {
    logger.trace('handleImport');
    const loadGameInput = document.getElementById(loadGameInputId);
    loadGameInput.click();
    e.currentTarget.blur();
  };

  handleExport = (e) => {
    logger.trace('handleExport');
    const { exportGame } = this.props;
    exportGame();
    e.currentTarget.blur();
  };

  handleResign = (e) => {
    logger.trace('handleResign');
    const { resign } = this.props;
    resign();
    e.currentTarget.blur();
  };

  render() {
    logger.trace('render');
    return (
      <div className="aside controls" style={{ height: boardSize }}>
        <div>
          <button type="button" onClick={this.handleNew} title="New Game">
            <Icon path={mdiNewBox} size={1.5} color="#eeeeee" />
          </button>
        </div>
        <div>
          <button type="button" onClick={this.handleImport} title="Import">
            <Icon path={mdiImport} size={1.5} color="#eeeeee" />
          </button>
        </div>
        <div>
          <button type="button" onClick={this.handleExport} title="Export">
            <Icon path={mdiTrayArrowDown} size={1.5} color="#eeeeee" />
          </button>
        </div>
        <div>
          <button type="button" onClick={this.handleResign} title="Resign">
            <Icon path={mdiFlag} size={1.5} color="#eeeeee" />
          </button>
        </div>
        <input type="file" id={loadGameInputId} onChange={this.readFile} accept="application/json" />
      </div>
    );
  }
}

export default Controls;
