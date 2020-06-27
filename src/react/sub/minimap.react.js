import React, { useRef, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import SButton from '../components/small_button.react';
import { Renderer } from '../../renderer';
import { GameRoom } from '../../gameroom';

const MiniMap = props => {
  const canvas = useRef();
  const info = useMemo(() => Renderer.minimap_info);

  useEffect(() => {
    if (canvas.current) {
      const board = GameRoom.board;
      if (board) {
        const context = canvas.current.getContext('2d');
        context.canvas.width = 300;
        context.canvas.height = 150;
        const mouse = {
          location: {
            x: 0,
            y: 0,
            cx: 300 / 2,
            cy: 150 / 2,
          },
        };
        info.Update(mouse, 0.03);
        info.UpdateCenterFromOffset(mouse);
        Renderer.RenderMinimap(canvas.current);
        // MiniMapInfo.Update(mouse, 0.03);
        // MiniMapInfo.UpdateCenterFromOffset(mouse);
        // board.Draw(context, MiniMapInfo);

        // Ping.DrawAll(context);
      }
    }
  }, [info.dirty]);

  return (
    <div className='minimap'>
      <canvas className='minimap-canvas' ref={canvas} />
      <div className='minimap-controls'>
        <SButton icon='add' />
        <SButton icon='delete' />
      </div>
    </div>
  );
};

export default observer(MiniMap);
