import React, { useState, useMemo } from 'react';
import {
  ButtonGroup,
  FormGroup,
  Callout,
  Collapse,
  Intent,
} from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { GameRoom } from '../../../gameroom';
import { useUrl } from '../../../renderables/game_objects/image_source';
import SButton from '../../components/small_button.react';
import SInput, { SInputDistance } from '../../components/small_input.react';
import Player from '../../../renderables/game_objects/player';

const PlayerTokenInfo = observer(props => {
  const [open, SetOpen] = useState(() => false);

  const player = useMemo(() => props.player);
  const token = useMemo(() => GameRoom.tokens.find(t => t.name == player.name));

  const color = useMemo(() => player.color);
  const [url, urlValid, handleURL] = useUrl(player);

  const run = useMemo(() => player.run);
  const fly = useMemo(() => player.fly);

  const runDistance = e => (player.run = Math.max(0, e.target.value));
  const flyDistance = e => (player.fly = Math.max(0, e.target.value));

  const intent = useMemo(() =>
    token && token.over ? Intent.PRIMARY : Intent.NONE
  );

  const style = useMemo(() => {
    let s = {};
    Object.assign(s, props.style);
    Object.assign(s, {
      backgroundImage: `linear-gradient(90deg,${color} 10px, rgba(0,0,0,0) 35px), var(${player.source.css})`,
    });
    return s;
  });

  return (
    <Callout
      intent={intent}
      icon={null}
      className='token-callout'
      style={style}
    >
      <input
        className='bp3-button token-color'
        type='color'
        value={color}
        onChange={player.OnChangeColor}
      />
      <FormGroup>
        <div className='space-between'>
          <ButtonGroup>
            <SButton
              title={player.name}
              onClick={() => SetOpen(!open)}
              className='token-list-name'
              text={player.name}
            />
            <SButton
              title='Move to center'
              onClick={token ? token.MoveToCenter : undefined}
              icon='inheritance'
              disabled={!token}
            />
            <SButton
              title='Zoom to'
              onClick={token ? token.CenterOn : undefined}
              icon='locate'
              disabled={!token}
            />
          </ButtonGroup>
          <ButtonGroup>{props.children}</ButtonGroup>
        </div>
        <Collapse isOpen={open} className='layer-info'>
          <FormGroup inline={false} label='Image URL'>
            <SInput
              onChange={handleURL}
              placeholder='url...'
              type='text'
              value={url}
              intent={urlValid}
            />
          </FormGroup>
          <PlayerVisionInfo {...props} />
          <FormGroup className='double-num' inline={false} label='Travel'>
            <SInputDistance
              value={run}
              onChange={runDistance}
              className='small-number'
              leftIcon='walk'
            />
            <SInputDistance
              value={fly}
              onChange={flyDistance}
              className='small-number'
              leftIcon='airplane'
            />
          </FormGroup>
        </Collapse>
      </FormGroup>
    </Callout>
  );
});

const PlayerVisionInfo = props => {
  const player = useMemo(() => props.player);

  const light = useMemo(() => player.vision[0]);
  const dim = useMemo(() => player.vision[1]);
  const dark = useMemo(() => player.vision[2]);
  const lightDistance = e => (player.vision[0] = Math.max(0, e.target.value));
  const dimDistance = e => (player.vision[1] = Math.max(0, e.target.value));
  const darkDistance = e => (player.vision[2] = Math.max(0, e.target.value));
  const light_color = Player.vision_colors[0];
  const dim_color = Player.vision_colors[1];
  const dark_color = Player.vision_colors[2];

  return (
    <React.Fragment>
      <FormGroup className='double-num' inline={false} label='Vision'>
        <SInputDistance
          value={light}
          onChange={lightDistance}
          className='small-number3'
          leftIcon='circle'
        />
        <SInputDistance
          value={dim}
          onChange={dimDistance}
          className='small-number3'
          leftIcon='selection'
        />
        <SInputDistance
          value={dark}
          onChange={darkDistance}
          className='small-number3'
          leftIcon='full-circle'
        />
      </FormGroup>
    </React.Fragment>
  );
};

export default PlayerTokenInfo;
