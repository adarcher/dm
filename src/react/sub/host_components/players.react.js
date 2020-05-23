import React from 'react';
import { Drawer, Position, Classes } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { GameRoom } from '../../../gameroom';
import SButton from '../../components/small_button.react';

const Players = props => {
  return (
    <>
      {GameRoom.players.map(p => (
        <PlayerInfo player={p} />
      ))}
    </>
  );
};

const PlayerInfo = observer(props => {
  const player = props.player;
  return (
    <div key={player.name} className='player-info'>
      <SButton
        key={player.name}
        onClick={player.AddToLayer}
        disabled={player.token}
      >
        {player.name}
      </SButton>
    </div>
  );
});

export default observer(Players);
