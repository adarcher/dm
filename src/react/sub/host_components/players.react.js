import React from 'react';
import { Drawer, Position, Classes } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { GameRoom } from '../../../gameroom';
import SButton from '../../components/small_button.react';

const Players = observer(props => {
  return (
    <Drawer
      icon='wrench'
      title='Current Players'
      isOpen={props.open}
      position={Position.LEFT}
      usePortal={false}
      autoFocus={true}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      enforceFocus={false}
      hasBackdrop={false}
      size={Drawer.SIZE_SMALL}
      onClose={() => props.SetOpen(false)}
    >
      <div className={Classes.DRAWER_BODY}>
        <div className={Classes.DIALOG_BODY}>
          {GameRoom.players.map(p => (
            <React.Fragment key={p.name}>
              <SButton key={p.name} onClick={p.AddToLayer} disabled={p.token}>
                {p.name}
              </SButton>
              <br />
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className={Classes.DRAWER_FOOTER}>Footer</div>
    </Drawer>
  );
});

export default Players;
