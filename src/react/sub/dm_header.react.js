import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import {
  Navbar,
  NavbarGroup,
  Tabs,
  Tab,
  Alignment,
  Icon,
  NavbarDivider,
} from '@blueprintjs/core';
import { TOOLSET, TOOLSET_ICON } from '../../misc/constants';
import SButton from '../components/small_button.react';
import ImageQueue from './image_queue.react';
import HostLink from './host_link.react';
import ArchiveControls from './archive_controls.react';
import ZoomControls from './zoom_controls.react';
import HotKeys from './hot_keys.react';

const TabIcon = toolset => {
  console.log(`Create Tab: ${toolset}`);
  return (
    <Tab
      key={toolset}
      className='tab-icon'
      id={toolset}
      title={<Icon icon={TOOLSET_ICON[toolset]} />}
      disabled={toolset === TOOLSET.Closed}
    />
  );
};

const DMHeader = props => {
  const screen = props.screen;
  const network_id = screen.user_id;
  const mode = useMemo(() => screen.mode);

  const toolset = useMemo(() => screen.toolset);

  const HostActions = () => [
    TOOLSET.Board,
    TOOLSET.Mobs,
    TOOLSET.Players,
    TOOLSET.Combat,
  ];

  const JoinActions = () => [TOOLSET.Player];

  const ModeActions = () => {
    console.log(`Showing ${mode} tabs...`);
    switch (mode) {
      case 'Host':
        return HostActions();
      case 'Join':
        return JoinActions();
    }
    return [];
  };

  const Left = () => (
    <>
      <SButton
        icon={TOOLSET_ICON[TOOLSET.None]}
        minimal={true}
        onClick={() => (screen.toolset = TOOLSET.None)}
        disabled={screen.toolset == TOOLSET.None}
      />
      <Tabs
        onChange={toolset => (screen.toolset = toolset)}
        selectedTabId={toolset}
      >
        {ModeActions().map(t => TabIcon(t))}
      </Tabs>
    </>
  );

  const Center = () => {
    switch (screen.mode) {
      case 'Host':
        return [
          <HostLink key='link' id={network_id} />,
          <NavbarDivider key='div' />,
          <ArchiveControls key='controls' />,
          <NavbarDivider key='div2' />,
          <HotKeys key='brushes' {...props} />,
        ];
      case 'Join':
        return [<HostLink key='link' id={network_id} />];
    }
    return [];
  };

  const Right = () => <ZoomControls />;

  return (
    <>
      <Navbar className='dm-header'>
        <NavbarGroup align={Alignment.LEFT}>{Left()}</NavbarGroup>
        <NavbarGroup>{Center()}</NavbarGroup>
        <NavbarGroup>{Right()}</NavbarGroup>
      </Navbar>
      <ImageQueue {...props} />
    </>
  );
};

export default observer(DMHeader);
