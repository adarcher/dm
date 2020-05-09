import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import PlayerTokenInfo from './join_components/player_token_info.react';
import SButton from '../components/small_button.react';
import { RenderInfo } from '../../render_info';
import ImageQueue from './image_queue.react';

var PlayerTools = observer(props => {
  const zoom = useMemo(() => RenderInfo.zoom, [RenderInfo.zoom]);
  return (
    <>
      <div id='tools'>
        <div className='player-tools'>
          <PlayerTokenInfo {...props} style={{ backgroundColor: '#3b3b3b' }} />
          <SButton
            small={true}
            icon='zoom-to-fit'
            text={`${(zoom * 100).toFixed(2)}%`}
            onClick={() => RenderInfo.setZoom(1)}
          />
        </div>
      </div>
      <ImageQueue {...props} />
    </>
  );
});
export default PlayerTools;
