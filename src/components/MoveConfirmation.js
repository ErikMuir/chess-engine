import React from 'react';
import Icon from '@mdi/react';
import { mdiCheck, mdiClose } from '@mdi/js';
import { iconColor } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('MoveConfirmation');

const MoveConfirmation = ({ confirmMove, cancelMove }) => {
  logger.trace('render');
  return (
    <div className="move-confirmation">
      <div>
        <button type="button" onClick={confirmMove} title="Confirm move" className="confirm-move">
          <Icon path={mdiCheck} size={1.5} color={iconColor} />
        </button>
      </div>
      <div>
        <button type="button" onClick={cancelMove} title="Cancel move">
          <Icon path={mdiClose} size={1.5} color={iconColor} />
        </button>
      </div>
    </div>
  );
};

export default MoveConfirmation;
