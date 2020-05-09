import React, { useEffect, useState } from 'react';
import { GameRoom } from '../../gameroom';
import { RenderInfo } from '../../render_info';
import { EnableInput, ResetInput } from '../../inputs';
import BoundingBox from '../../renderables/widgets/bounding_box';
import HostHeader from '../sub/host_header.react';
import HostTools from '../sub/host_tools.react';
import { Networking } from '../../networking/websocket';

const SendGameState = state => {
  Networking.Send({ game: state });
};

export default function Host(props) {
  // For setting LayerImage values
  const [gridSizer] = useState(new BoundingBox());

  useEffect(() => {
    gridSizer.FromLayer(GameRoom.layer);
  }, [GameRoom.board.layer_id]);

  useEffect(() => {
    GameRoom.LoadFromDisk();
    RenderInfo.CenterOnGrid(GameRoom.board.focus);

    gridSizer.visible = false;
    // gridSizer.FromLayer(GameRoom.layer);
    RenderInfo.widgets.push(gridSizer);

    RenderInfo.fog_color = 'rgba(0,0,0,.75)';

    var input = document.getElementById('input');
    EnableInput(input, true);

    GameRoom.SubscribeToStateChange('host', SendGameState);

    return () => {
      ResetInput(input);

      GameRoom.UnSubscribeToStateChange('host');

      RenderInfo.ExitMode();
    };
  }, []);

  return (
    <React.Fragment>
      <HostHeader className='ui' {...props} gridSizer={gridSizer} />
      <HostTools className='ui' screen={props.screen} boundingBox={gridSizer} />
    </React.Fragment>
  );
}
