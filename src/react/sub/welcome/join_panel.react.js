import React, { useMemo } from 'react';
import {
  Button,
  InputGroup,
  ButtonGroup,
  Popover,
  Menu,
  MenuItem,
  Classes,
  FormGroup,
} from '@blueprintjs/core';
import Player from '../../../renderables/game_objects/player';
import SInput, { SInputDistance } from '../../components/small_input.react';
import SButton from '../../components/small_button.react';

const Options = props => {
  return (
    <Menu>
      {props.items.map(name => (
        <MenuItem
          key={name}
          value={name}
          text={name}
          onClick={() => props.handle(name)}
          className={Classes.POPOVER_DISMISS}
        />
      ))}
    </Menu>
  );
};

const JoinPanel = props => {
  const name = props.name;
  const setName = e => props.setName(e);
  const room = props.room;
  const setRoom = e => props.setRoom(e);

  // const handleRoomIdChange = event => {
  //   props.SetRoomId(event.target.value);
  // };

  // const handlePlayerNameChange = event => {
  //   if (event.target) {
  //     props.SetPlayerName(event.target.value);
  //   } else {
  //     props.SetPlayerName(event);
  //   }
  // };

  const names = useMemo(() => Player.CachedPlayers());

  return (
    <>
      <FormGroup inline={true} label='Character Name' className='formatted'>
        <ButtonGroup>
          <SInput
            id='name-input'
            value={name}
            placeholder='Character Name'
            onChange={setName}
          />
          <Popover
            content={<Options items={names} handle={setName} {...props} />}
            minimal={true}
            position='bottom'
          >
            <SButton icon='caret-down' disabled={names.length == 0} />
          </Popover>
        </ButtonGroup>
      </FormGroup>
      <FormGroup inline={true} label='Room ID' className='formatted'>
        <SInput
          id='room-input'
          placeholder='Room ID'
          value={room}
          onChange={setRoom}
        />
      </FormGroup>
    </>
  );
};

export default JoinPanel;
