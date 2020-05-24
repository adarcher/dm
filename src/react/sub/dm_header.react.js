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
  ButtonGroup,
} from '@blueprintjs/core';
import { TOOLSET, TOOLSET_ICON } from '../../misc/constants';
import SButton from '../components/small_button.react';
import ImageQueue from './image_queue.react';
import HostLink from './host_link.react';
import ArchiveControls from './archive_controls.react';
import ZoomControls from './zoom_controls.react';
import HotKeys from './hot_keys.react';
import MapTools from './map_tools.react';

const TabIcon = toolset => {
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
  const mode = useMemo(() => screen.mode);
  const network_id = mode == 'Host' ? screen.user_id : screen.join_id;

  const toolset = useMemo(() => screen.toolset);

  const HostActions = () => [
    TOOLSET.Board,
    TOOLSET.Mobs,
    TOOLSET.Players,
    TOOLSET.Combat,
  ];

  const JoinActions = () => [TOOLSET.Player];

  const ModeActions = () => {
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
          <NavbarDivider key='div3' />,
          <MapTools key='map' />,
        ];
      case 'Join':
        return [<HostLink key='link' id={network_id} />];
    }
    return (
      <ButtonGroup>
        <SButton text={BRANCH} />
        <SButton text={VERSION} />
      </ButtonGroup>
    );
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
