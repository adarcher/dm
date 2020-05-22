import React, { useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { ButtonGroup } from '@blueprintjs/core';
import SButton from '../components/small_button.react';
import { RenderInfo } from '../../render_info';
import { GridSizer } from '../../renderables/widgets/grid_sizer';
import { GameRoom } from '../../gameroom';

const MapTools = props => {
  const show_sizer = useMemo(() => GridSizer.visible);
  const show_grid = useMemo(() => RenderInfo.grid_on);

  useEffect(() => {
    GridSizer.FromLayer(GameRoom.layer);
  }, [GameRoom.board.layer_id]);

  return (
    <ButtonGroup>
      <SButton
        icon='grid'
        active={show_sizer}
        onClick={() => (GridSizer.visible = !show_sizer)}
      />
      <SButton
        icon='grid-view'
        active={show_grid}
        onClick={() => (RenderInfo.grid_on = !show_grid)}
      />
    </ButtonGroup>
  );
};

export default observer(MapTools);
