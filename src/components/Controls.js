import React from 'react';
import Icon from '@mdi/react';
import {
  mdiFlag,
  mdiNewBox,
  mdiImport,
  mdiTrayArrowDown,
} from '@mdi/js';
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
    this.fileReader.onload = () => this.handleLoad(this.fileReader.result);
  }

  readFile = () => {
    logger.trace('readFile');
    const loadGameInput = document.getElementById(loadGameInputId);
    const file = loadGameInput.files[0];
    this.fileReader.readAsText(file);
  };

  validateGameJson = (gameJson) => {
    logger.trace('validateGameJson');
    if (!gameJson || !gameJson.schema) {
      throw new Error('Invalid game json');
    }
    switch (gameJson.schema) {
      case '0.0.1': validateSchema_0_0_1(gameJson); break;
      default: validateSchema_1_0_0(gameJons); break;
    }
    if (
      !gameJson
      || !gameJson.fen
      || !gameJson.pgn2
      || !gameJson.pgn2.white
      || !gameJson.pgn2.black
    ) {
      throw new Error('Invalid game json');
    }
  };

  validateSchema_0_0_1 = (gameJson) => {
    logger.trace('validateSchema_0_0_1');
    if (
      !gameJson
      || !gameJson.fen
      || !gameJson.pgn
      || !gameJson.pgn.white
      || !gameJson.pgn.black
    ) {
      throw new Error('Invalid game json');
    }
  };

  validateSchema_1_0_0 = (gameJson) => {
    logger.trace('validateSchema_1_0_0');
    if (
      !gameJson
      || !gameJson.fen
      || !gameJson.pgn
      || !Array.isArray(gameJson.pgn)
      || gameJson.pgn.some((move) => !move.white)
      || gameJson.pgn.filter((move) => !move.black).length > 1
    ) {
      throw new Error('Invalid game json');
    }
  };

  handleLoad = (readerResult) => {
    logger.trace('handleLoad');
    try {
      const gameJson = JSON.parse(readerResult);
      this.validateGameJson(gameJson);
      const { importGame } = this.props;
      importGame(gameJson);
    } catch (err) {
      logger.error('Error loading game', err);
      // TODO : inform user
    }
  };

  handleNew = (e) => {
    logger.trace('handleNew');
    e.currentTarget.blur();
    const { newGame } = this.props;
    newGame();
  };

  handleImport = (e) => {
    logger.trace('handleImport');
    e.currentTarget.blur();
    const loadGameInput = document.getElementById(loadGameInputId);
    loadGameInput.click();
  };

  handleExport = (e) => {
    logger.trace('handleExport');
    e.currentTarget.blur();
    const { exportGame } = this.props;
    exportGame();
  };

  handleResign = (e) => {
    logger.trace('handleResign');
    e.currentTarget.blur();
    const { resign } = this.props;
    resign();
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
