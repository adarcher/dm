import { Grid } from './misc/grid.js';
import { GameRoom } from './gameroom';
import { RenderInfo } from './render_info.js';
import { GRID_WIDTH } from './misc/constants.js';
import { DrawPing } from './renderables/ping.js';

const GetContext = canvas => {
  var context = canvas.getContext('2d');
  context.canvas.width = canvas.clientWidth;
  context.canvas.height = canvas.clientHeight;
  return context;
};

class RendererSingleton {
  dirty = false;

  frames = 0;
  fps = 0;
  frame_time = 0;
  Render = canvas => {
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

    var board = GameRoom.board;
    if (!board) {
      const context = canvas.getContext('2d');
      context.fillStyle = 'black';
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      return;
    }

    const context = GetContext(canvas);

    board.Draw(context);

    if (RenderInfo.grid_on) {
      const start = RenderInfo.grid_start;
      const line_width = RenderInfo.Zoom(GRID_WIDTH);
      const grid_delta = RenderInfo.grid_delta;
      Grid(context, start, line_width, grid_delta);
    }

    // board.layers.filter(l => l.visible).forEach(l => l.fog.Draw(context));
    RenderInfo.widgets.forEach(widget => widget.Draw(context));

    GameRoom.tokens.forEach(token => token.DrawOver(context));

    RenderInfo.pings.forEach(p => {
      DrawPing(context, p);
    });
  };
}

export const Renderer = new RendererSingleton();
