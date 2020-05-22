import React, { useState, useEffect, useReducer, useRef } from 'react';
import {
  ButtonGroup,
  FormGroup,
  Callout,
  Collapse,
  Intent,
} from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import SButton from '../../components/small_button.react';
import { useUrl } from '../../../renderables/game_objects/image_source';
import SInput, { SInputNumber } from '../../components/small_input.react';
import TokenPreview from '../token_preview.react';

const TokenInfo = props => {
  const [open, SetOpen] = useState(() => false);

  const token = useMemo(() => props.token);
  const name = useMemo(() => token.name, [token.name]);
  const x = useMemo(() => token.x, [token.x]);
  const y = useMemo(() => token.y, [token.y]);
  const size = useMemo(() => token.size, [token.size]);
  const visible = useMemo(() => token.visible, [token.visible]);
  const color = useMemo(() => token.color, [token.color]);
  const [url, urlValid, handleURL] = useUrl(token);

  const intent = useMemo(() => (token.over ? Intent.PRIMARY : Intent.NONE), [
    token.over,
  ]);

  const gradient = useMemo(
    () => `linear-gradient(90deg,${color} 10px, rgba(0,0,0,0) 35px)`,
    [color]
  );

  const style = useMemo(() => ({
    backgroundImage: `${gradient}`,
  }));

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
        onChange={token.OnChangeColor}
      />
      <TokenPreview token={token} />
      <FormGroup>
        <div className='space-between'>
          <ButtonGroup>
            <SButton
              title={`${visible ? 'Hide' : 'Show'}`}
              onClick={token.ToggleVisible}
              icon={visible ? 'eye-open' : 'eye-off'}
            />
            <SButton title='Copy' onClick={token.Copy} icon='duplicate' />
            <SButton
              title='Move to center'
              onClick={token.MoveToCenter}
              icon='inheritance'
            />
            <SButton title='Zoom to' onClick={token.CenterOn} icon='locate' />
            <SButton
              title={token.name}
              onClick={() => SetOpen(!open)}
              className='token-list-name'
              text={token.name}
            />
          </ButtonGroup>
          <ButtonGroup>
            <SButton title='delete' onClick={token.Remove} icon='delete' />
          </ButtonGroup>
        </div>
        <Collapse isOpen={open} className='layer-info'>
          <FormGroup inline={false} label='Name'>
            <SInput
              onChange={token.OnNameChange}
              placeholder='Token Name...'
              value={name}
            />
          </FormGroup>
          <FormGroup inline={false} label='Image URL'>
            <SInput
              onChange={handleURL}
              placeholder='url...'
              value={url}
              intent={Intent.NONE}
            />
          </FormGroup>
          <FormGroup
            className='formatted double-num'
            inline={false}
            label='Position'
          >
            <SInputNumber
              value={x}
              onChange={token.OnXChange}
              className='small-number'
              leftIcon='arrows-horizontal'
            />
            <SInputNumber
              value={y}
              onChange={token.OnYChange}
              className='small-number'
              leftIcon='arrows-vertical'
            />
          </FormGroup>
          <FormGroup
            className='formatted double-num'
            inline={false}
            label='Size'
          >
            <SInputNumber
              value={size}
              onChange={token.OnSizeChange}
              className='small-number'
            />
          </FormGroup>
        </Collapse>
      </FormGroup>
    </Callout>
  );
};

export default observer(TokenInfo);
