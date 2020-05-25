import React, { useRef, useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import SButton from '../components/small_button.react';
import { Renderer } from '../../renderer';
import { MiniMapInfo, RenderInfo } from '../../render_info';
import { GameRoom } from '../../gameroom';
import { Grid } from '../../misc/grid';
import { DrawPing } from '../../renderables/ping';

const MiniMap = props => {
  const canvas = useRef();
  const dirty = useMemo(() => Renderer.dirty);

  useEffect(() => {
    console.log('draw minimap');
    if (canvas.current) {
      const board = GameRoom.board;
      if (board) {
        const context = canvas.current.getContext('2d');
        context.canvas.width = 300;
        context.canvas.height = 150;
        const mouse = {
          x: 0,
          y: 0,
          cx: 300 / 2,
          cy: 150 / 2,
        };
        MiniMapInfo.Update(mouse, 0.03);
        MiniMapInfo.UpdateCenterFromOffset(mouse);
        board.Draw(context, MiniMapInfo);

        RenderInfo.pings.forEach(p => {
          DrawPing(context, p, MiniMapInfo);
        });
      }
    }
  }, [Renderer.dirty]);

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
