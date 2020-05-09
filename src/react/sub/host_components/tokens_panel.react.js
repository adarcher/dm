import React from 'react';
import {
  Drawer,
  Position,
  Classes,
  FormGroup,
  Label,
  Divider,
} from '@blueprintjs/core';
import { observer } from 'mobx-react';
import TokenInfo from './token_info.react';
import { GameRoom } from '../../../gameroom';
import SButton from '../../components/small_button.react';
import Token from '../../../renderables/game_objects/token';

const Tokens = observer(props => {
  const add = () => GameRoom.tokens.push(new Token());
  const allTokens = () => {
    return GameRoom.board.layers.flatMap(layer => layer.tokens);
  };

  return (
    <Drawer
      icon='wrench'
      title='Current (N)PCs'
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
          <FormGroup vertial={true}>
            <div className='space-between'>
              <Label style={{ margin: 0 }}>Tokens</Label>
              <SButton icon='new-person' onClick={add} />
            </div>
            <Divider />
            {allTokens().map(token => (
              <TokenInfo key={token.key} token={token} />
            ))}
          </FormGroup>
        </div>
      </div>
      <div className={Classes.DRAWER_FOOTER}>Footer</div>
    </Drawer>
  );
});

export default Tokens;
