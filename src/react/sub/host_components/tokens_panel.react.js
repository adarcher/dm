import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Position,
  Classes,
  FormGroup,
  Label,
  Divider,
  ButtonGroup,
  Popover,
  InputGroup,
} from '@blueprintjs/core';
import { observer } from 'mobx-react';
import TokenInfo from './token_info.react';
import { GameRoom } from '../../../gameroom';
import SButton from '../../components/small_button.react';
import Token from '../../../renderables/game_objects/token';
import Enum from '../../../misc/enum';

const TokenSphere = Enum(['Current', 'All', 'Theme']);

const Tokens = props => {
  const [sphere, setSphere] = useState(TokenSphere.Current);

  const add = () => GameRoom.tokens.push(new Token());
  const allTokens = () => {
    switch (sphere) {
      case TokenSphere.All:
        return GameRoom.tokens;
      case TokenSphere.Current:
        return GameRoom.board.layers.flatMap(layer => layer.tokens);
      case TokenSphere.Theme:
        return []; // Add in filter to GameRoom
    }
  };

  const tokens = useMemo(() => [...allTokens()]);
  const combat = useMemo(() => {
    const combat_tokens = tokens.filter(t => t.current_roll[1] != 0);
    combat_tokens.sort((a, b) => b.current_roll[0] - a.current_roll[0]);
    return combat_tokens;
  });
  const other = tokens.filter(t => t.current_roll[1] == 0);

  const ResetCombat = () => {
    tokens.forEach(t => (t.current_roll = [0, 0, 0]));
  };

  return (
    <>
      <FormGroup vertial={true}>
        <div className='space-between'>
          <Popover>
            <SButton text={sphere} rightIcon='caret-down' />
          </Popover>
          <SButton icon='reset' onClick={ResetCombat} />
          <SButton icon='new-person' onClick={add} />
        </div>
        <Divider />
        {combat.map(token => (
          <TokenInfo key={token.key} token={token} />
        ))}
        <Divider />
        {other.map(token => (
          <TokenInfo key={token.key} token={token} />
        ))}
      </FormGroup>
    </>
  );
};

export default observer(Tokens);
