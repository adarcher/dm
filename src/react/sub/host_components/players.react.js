import React from 'react';
import { Drawer, Position, Classes } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { GameRoom } from '../../../gameroom';
import SButton from '../../components/small_button.react';

const Players = props => {
  return (
    <>
      {GameRoom.players.map(p => (
        <React.Fragment key={p.name}>
          <SButton key={p.name} onClick={p.AddToLayer} disabled={p.token}>
            {p.name}
          </SButton>
          <br />
        </React.Fragment>
      ))}
    </>
  );
};

export default observer(Players);
