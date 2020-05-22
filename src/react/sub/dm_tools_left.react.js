import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import { Drawer, Position, Classes } from '@blueprintjs/core';
import { TOOLSET } from '../../misc/constants';
import SButton from '../components/small_button.react';
import { GameRoom } from '../../gameroom';
import PlayerTokenInfo from './join_components/player_token_info.react';
import Edit from './host_components/edit.react';
import Players from './host_components/players.react';
import LayerInfo from './host_components/layer_info.react';
import Tokens from './host_components/tokens_panel.react';

const DMToolsLeft = props => {
  const screen = props.screen;
  const open = useMemo(() => screen.toolset != TOOLSET.None);

  const DrawerContent = () => {
    switch (screen.toolset) {
      case TOOLSET.Player:
        return <PlayerTokenInfo {...props} />;
      case TOOLSET.Board:
        return <Edit {...props} />;
      case TOOLSET.Players:
        return <Players {...props} />;
      case TOOLSET.Mobs:
        return <Tokens {...props} />;
    }
    return <></>;
  };
  return (
    <Drawer
      isOpen={open}
      position={Position.LEFT}
      usePortal={false}
      autoFocus={true}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      enforceFocus={false}
      hasBackdrop={false}
      className='dm-tools'
      size={Drawer.SIZE_SMALL}
    >
      <div className={Classes.DRAWER_BODY}>
        <div className={Classes.DIALOG_BODY}>{DrawerContent()}</div>
      </div>
    </Drawer>
  );
};

export default observer(DMToolsLeft);
