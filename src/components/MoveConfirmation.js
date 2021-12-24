import React from 'react';
import Icon from '@mdi/react';
import { mdiCheck, mdiClose } from '@mdi/js';
import { iconColor } from '../game/utils';
import Logger from '../Logger';

const logger = new Logger('MoveConfirmation');

const MoveConfirmation = ({ confirmMove, cancelMove }) => {
  logger.trace('render');

  const handleConfirm = (e) => {
    logger.trace('handleConfirm');
    confirmMove();
    e.currentTarget.blur();
  };

  const handleCancel = (e) => {
    logger.trace('handleCancel');
    cancelMove();
    e.currentTarget.blur();
  };

  return (
    <>
      <div>
        <button type="button" onClick={handleConfirm} title="Confirm move" className="confirm-move">
          <Icon path={mdiCheck} size={1.5} color={iconColor} />
        </button>
      </div>
      <div>
        <button type="button" onClick={handleCancel} title="Cancel move">
          <Icon path={mdiClose} size={1.5} color={iconColor} />
        </button>
      </div>
    </>
  );
};

export default MoveConfirmation;
