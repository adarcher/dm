import { observer } from 'mobx-react';
import React, { useMemo } from 'react';
import SButton from '../components/small_button.react';
import { RenderInfo } from '../../render_info';
import { Tag, Intent } from '@blueprintjs/core';
import { NetworkLatency } from '../../networking/websocket';
import { GameRoom } from '../../gameroom';

const ZoomControls = props => {
  // const latency = useMemo(() => GameRoom.latency);
  // const latency_size = useMemo(() => GameRoom.latency_size);
  // const latency_window = useMemo(() => GameRoom.latency_window);
  // return (
  //   <>
  //     <Tag intent={Intent.PRIMARY}>{`${latency_size}chars`} </Tag>
  //     <Tag intent={Intent.PRIMARY}>{`${parseInt(latency)}ms`} </Tag>
  //     <Tag intent={Intent.PRIMARY}>{`${latency_window}`} </Tag>
  //     <SButton
  //       icon='zoom-to-fit'
  //       text={`${(RenderInfo.zoom * 100).toFixed(2)}%`}
  //       onClick={() => RenderInfo.setZoom(1)}
  //     />
  //   </>
  // );
  return (
    <SButton
      icon='zoom-to-fit'
      text={`${(RenderInfo.zoom * 100).toFixed(2)}%`}
      onClick={() => RenderInfo.setZoom(1)}
    />
  );
};

export default observer(ZoomControls);
