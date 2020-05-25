import { Grid } from './misc/grid.js';
import { GameRoom } from './gameroom';
import { GRID_WIDTH } from './misc/constants.js';
import { DrawPing } from './renderables/ping.js';
import { observable } from 'mobx';

const GetContext = canvas => {
  var context = canvas.getContext('2d');
  context.canvas.width = canvas.clientWidth;
  context.canvas.height = canvas.clientHeight;
  return context;
};

class RendererSingleton {
  @observable dirty = false;

  frames = 0;
  fps = 0;
  frame_time = 0;
  Render = (canvas, render_context) => {
    GameRoom.CheckState();
    if (!this.dirty || !canvas) return;
    this.frames++;
    const now = Date.now();
    const delta = (now - this.frame_time) / 1000;
    if (delta > 0.5) {
      this.fps = this.frames / delta;
      this.frames = 0;
      this.frame_time = now;
    }
    this.dirty = false;
    if (!GameRoom.dm && GameRoom.hidden) {
      const context = canvas.getContext('2d');
      context.fillStyle = 'black';
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      context.font = `bold 32px serif`;
      context.fillStyle = 'white';
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      context.fillText(
        'DM is working on something...',
        context.canvas.width / 2,
        context.canvas.height * 0.55
      );
      return;
    }

    var board = GameRoom.board;
    if (!board) {
      const context = canvas.getContext('2d');
      context.fillStyle = 'black';
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      return;
    }

    const context = GetContext(canvas);

    board.Draw(context, render_context);

    if (render_context.grid_on) {
      const start = render_context.grid_start;
      const line_width = render_context.Zoom(GRID_WIDTH);
      const grid_delta = render_context.grid_delta;
      Grid(context, start, line_width, grid_delta);
    }

    render_context.widgets.forEach(widget =>
      widget.Draw(context, render_context)
    );

    GameRoom.tokens.forEach(token => token.DrawOver(context, render_context));

    render_context.pings.forEach(p => {
      DrawPing(context, p, render_context);
    });
  };
}

export const Renderer = new RendererSingleton();
export const MiniMapRenderer = new RendererSingleton();
