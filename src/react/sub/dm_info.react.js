import { observer } from 'mobx-react';
import React, { useState, useEffect } from 'react';
import {
  Overlay,
  Dialog,
  Classes,
  Tabs,
  Tab,
  Button,
  Intent,
} from '@blueprintjs/core';
import SButton from '../components/small_button.react';
import HostPanel from './welcome/host_panel.react';
import JoinPanel from './welcome/join_panel.react';
import Player from '../../renderables/game_objects/player';

// TODO: Make this generic, for now it's just the Host/Join/View startup
const DMInfo = props => {
  const screen = props.screen;
  const network_id = screen.user_id;
  const showClose = props.hideClose ? true : false;
  const isWelcome = screen.mode == 'Welcome';
  const Play = () => (screen.mode = mode);

  const [mode, setMode] = useState(() => (screen.join_id ? 'Join' : 'Host'));
  const [room, _setRoom] = React.useState(screen.join_id || '');
  const [name, _setName] = useState(Player.LastUsedName || '');

  const setRoom = room => {
    if (room.target) {
      room = room.target.value;
    }
    _setRoom(room);
    screen.join_id = room;
  };

  const setName = name => {
    if (name.target) {
      name = name.target.value;
    }
    _setName(name);
    screen.user_name = name;
  };

  useEffect(() => {
    setName(name);
    setRoom(room);
  });

  return (
    <Dialog isOpen={isWelcome} title='Welcome!' isCloseButtonShown={showClose}>
      <div className={Classes.DIALOG_BODY}>
        <Tabs
          id='HostJoin'
          onChange={mode => setMode(mode)}
          selectedTabId={mode}
          vertical={true}
          large={true}
          style={{
            alignItems: 'center',
          }}
          className='info-panel'
        >
          <Tab id='Host' title='Host' panel={<HostPanel screen={screen} />} />
          <Tab
            id='Join'
            title='Join'
            panel={
              <JoinPanel
                screen={screen}
                name={name}
                setName={setName}
                setRoom={setRoom}
                room={room}
              />
            }
          />
        </Tabs>
      </div>
      <div
        className={Classes.DIALOG_FOOTER}
        style={{
          alignSelf: 'center',
        }}
      >
        <Button
          large={true}
          icon='play'
          text='Start'
          onClick={Play}
          intent={Intent.SUCCESS}
        />
      </div>
    </Dialog>
  );
};

export default observer(DMInfo);
