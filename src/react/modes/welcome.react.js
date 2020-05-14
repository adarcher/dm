import React, { useEffect, useMemo } from 'react';
import {
  Tab,
  Tabs,
  Button,
  InputGroup,
  ButtonGroup,
  Popover,
  Menu,
  MenuItem,
} from '@blueprintjs/core';
import Enum from '../../misc/enum';
import { GameRoom } from '../../gameroom';
import { RenderInfo } from '../../render_info';
import Player from '../../renderables/game_objects/player';

const Modes = Enum(['Host', 'Join']);

export default function Welcome(props) {
  console.log(JSON.stringify(props.join_id));
  const [mode, SetMode] = React.useState(
    props.join_id ? Modes.Join : Modes.Host
  );
  const [room_id, SetRoomId] = React.useState(props.join_id || '');
  const [player_name, SetPlayerName] = React.useState(
    Player.LastUsedName || ''
  );

  // Random Scrolling
  const Pan = () => {
    const x = GameRoom.RandomU();
    const y = GameRoom.RandomV();
    RenderInfo.AnimateTo({ x: x, y: y }, 10000, true);
  };

  var pan_animation = false;

  useEffect(() => {
    // Extras
    // RenderInfo.AddBlur(6);
    var input = document.getElementById('input');
    input.className = 'sceen_element blury';

    RenderInfo.fog_color = 'rgb(0,0,0,.75)';

    const x = GameRoom.RandomU();
    const y = GameRoom.RandomV();
    RenderInfo.UpdateOffsetFromCenter({ x: x, y: y });
    Pan();
    pan_animation = setInterval(Pan, 10000);

    return () => {
      // Clear Random Scrolling
      clearInterval(pan_animation);

      input.className = 'sceen_element';
      // Extras and Animations cleared
      RenderInfo.ExitMode();
    };
  }, []);

  const handlePlay = event => {
    if (mode == Modes.Host) {
      props.screen.Host();
    } else {
      if (room_id != '0') {
        props.screen.Join(room_id, player_name);
      }
    }
  };

  return (
    <React.Fragment>
      <div id='welcome_container' className='ui'>
        Welcome!
      </div>
      <div id='join' className='ui'>
        <Tabs
          id='HostJoin'
          onChange={mode => SetMode(mode)}
          selectedTabId={mode}
        >
          <Tab
            id={Modes.Host}
            title={Modes.Host}
            panel={<HostPanel screen={props.screen} />}
          />
          <Tab
            id={Modes.Join}
            title={Modes.Join}
            panel={
              <JoinPanel
                screen={props.screen}
                name={player_name}
                SetPlayerName={SetPlayerName}
                SetRoomId={SetRoomId}
                room_id={room_id}
              />
            }
          />
        </Tabs>
        <Button onClick={handlePlay}>Play!</Button>
      </div>
    </React.Fragment>
  );
}

const HostPanel = props => {
  const CreateJoinLink = () => {
    const link = `${window.location.toString()}?join=${props.screen.user_id}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <div className='WelcomePanel'>
      <div className='centered'>
        <div>Share this Room ID:</div>
        <div id='host_id_span'>
          <ButtonGroup>
            <Button
              large={true}
              text={props.screen.user_id}
              icon='clipboard'
              onClick={() =>
                navigator.clipboard.writeText(props.screen.user_id)
              }
            />
            <Button large={true} icon='link' onClick={CreateJoinLink} />
          </ButtonGroup>
        </div>
        <br />
      </div>
    </div>
  );
};

const Options = props => {
  return (
    <Menu>
      {props.items.map(name => (
        <MenuItem
          key={name}
          value={name}
          text={name}
          onClick={() => props.handle(name)}
        />
      ))}
    </Menu>
  );
};

const JoinPanel = props => {
  const handleRoomIdChange = event => {
    props.SetRoomId(event.target.value);
  };

  const handlePlayerNameChange = event => {
    if (event.target) {
      props.SetPlayerName(event.target.value);
    } else {
      props.SetPlayerName(event);
    }
  };

  const names = useMemo(() => Player.CachedPlayers());

  return (
    <div className='WelcomePanel'>
      <div className='centered'>
        <ButtonGroup>
          <InputGroup
            id='name-input'
            value={props.name}
            placeholder='Character Name'
            onChange={handlePlayerNameChange}
          />
          <Popover
            content={
              <Options
                items={names}
                handle={handlePlayerNameChange}
                {...props}
              />
            }
            minimal={true}
            position='bottom'
          >
            <Button icon='caret-down' disabled={names.length == 0} />
          </Popover>
        </ButtonGroup>
        <br />
        <InputGroup
          id='room-input'
          placeholder='Room ID'
          value={props.room_id}
          onChange={handleRoomIdChange}
        />
        <br />
      </div>
    </div>
  );
};
