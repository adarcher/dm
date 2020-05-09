import React, { useState } from 'react';
import {
  ButtonGroup,
  FormGroup,
  Collapse,
  Intent,
  Callout,
} from '@blueprintjs/core';
import { observer } from 'mobx-react';
import GridInfo from './grid_info.react';
import { GameRoom } from '../../../gameroom';
import { useUrl } from '../../../renderables/game_objects/image_source';
import SInput from '../../components/small_input.react';
import SButton from '../../components/small_button.react';

const LayerInfo = observer(props => {
  const layer = props.layer;
  const active = GameRoom.board.layer_id == props.index;
  const intent = active ? Intent.PRIMARY : Intent.NONE;
  const visible_icon = layer.visible ? 'eye-open' : 'eye-off';

  const [open, SetOpen] = useState(() => false);

  const [url, urlValid, handleURL] = useUrl(layer.background);
  const [url_dm, urlValid_dm, handleURL_dm] = useUrl(layer.background_dm);

  return (
    <Callout intent={intent} icon={null}>
      <FormGroup>
        <div className='space-between'>
          <ButtonGroup>
            <SButton onClick={layer.ToggleVisible} icon={visible_icon} />
            <SButton icon='caret-up' onClick={layer.OnMoveUp} />
            <SButton icon='caret-down' onClick={layer.OnMoveDown} />
            <SButton
              className='layer-list-name'
              onClick={() => SetOpen(!open)}
              text={layer.name}
            />
            <SButton icon='draw' onClick={layer.OnActivate} intent={intent} />
          </ButtonGroup>
          <span>
            <ButtonGroup>
              <SButton onClick={layer.OnDelete} icon='delete' />
            </ButtonGroup>
          </span>
        </div>
        <Collapse isOpen={open} className='layer-info'>
          <FormGroup inline={false} label='Name'>
            <SInput
              onChange={layer.OnNameChange}
              placeholder='Layer Name...'
              value={layer.name}
            />
          </FormGroup>
          <FormGroup inline={false} label='Image URL'>
            <SInput
              onChange={handleURL}
              placeholder='url...'
              value={url}
              intent={urlValid}
            />
          </FormGroup>
          <FormGroup inline={false} label='Image URL (dm)'>
            <SInput
              onChange={handleURL_dm}
              placeholder='url... (dm)'
              value={url_dm}
              intent={urlValid_dm}
            />
          </FormGroup>
          <GridInfo {...props} />
        </Collapse>
      </FormGroup>
    </Callout>
  );
});

export default LayerInfo;
