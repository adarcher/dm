import { observer } from 'mobx-react';
import React from 'react';
import { GameRoom } from '../../gameroom';
import { ImportRoom } from './host_components/import.react';
import { Popover, ButtonGroup } from '@blueprintjs/core';
import SButton from '../components/small_button.react';

const ArchiveControls = props => {
  return (
    <ButtonGroup>
      <SButton icon='floppy-disk' onClick={() => GameRoom.SaveToDisk()} />
      <Popover content={<ImportRoom />} minimal={true}>
        <SButton icon='import' />
      </Popover>
      <SButton icon='export' onClick={GameRoom.Export} />
    </ButtonGroup>
  );
};

export default observer(ArchiveControls);
