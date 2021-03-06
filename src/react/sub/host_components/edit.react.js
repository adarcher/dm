import React, { useMemo } from 'react';
import {
  Drawer,
  Position,
  Classes,
  FormGroup,
  TextArea,
  Label,
  Divider,
  ButtonGroup,
  Popover,
  MenuItem,
  Menu,
  Switch,
} from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { GameRoom } from '../../../gameroom';
import SInput from '../../components/small_input.react';
import SButton from '../../components/small_button.react';
import LayerInfo from './layer_info.react';

const Options = props => {
  return (
    <Menu>
      {props.items.map(b => (
        <MenuItem key={b.key} value={b} text={b.name} onClick={b.OnActivate} />
      ))}
    </Menu>
  );
};

const Edit = props => {
  const board = useMemo(() => GameRoom.board);
  const layers = useMemo(() => board.layers, [board.layers]);
  const name = useMemo(() => board.name, [board.name]);

  const boards = useMemo(() => GameRoom.boards);

  const hidden = useMemo(() => GameRoom.hidden);
  const ToggleHidden = () => (GameRoom.hidden = !GameRoom.hidden);

  return (
    <>
      <FormGroup inline={false}>
        <ButtonGroup>
          <SInput
            placeholder='Board Name...'
            onChange={GameRoom.board.OnNameChange}
            value={name}
          />
          <Popover
            content={<Options items={boards} />}
            minimal={true}
            position='bottom'
            usePortal={false}
          >
            <SButton icon='caret-down' disabled={boards.length == 0} />
          </Popover>
          <SButton onClick={board.OnDelete} icon='delete' />
          <SButton onClick={GameRoom.AddBoard} icon='add' />
        </ButtonGroup>
      </FormGroup>
      <Switch
        checked={hidden}
        label='Hidden to Players'
        onChange={ToggleHidden}
      />
      <FormGroup inline={false}>
        <TextArea
          placeholder='And the story goes... (Not implemented)'
          small={true}
          fill={true}
          value={board.description}
          onChange={board.OnDescriptionChange}
        />
      </FormGroup>
      <FormGroup vertial={true}>
        <div className='space-between'>
          <Label style={{ margin: 0 }}>Layers</Label>
          <SButton icon='new-layer' onClick={GameRoom.AddLayer} />
        </div>
        <Divider />
        {layers.map((l, i) => (
          <LayerInfo {...props} layer={l} key={l.key} index={i} />
        ))}
      </FormGroup>
    </>
  );
};

export default observer(Edit);
