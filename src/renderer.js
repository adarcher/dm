import { Grid } from './misc/grid.js';
import { GameRoom } from './gameroom';
import { GRID_WIDTH } from './misc/constants.js';
import Ping, { DrawPing } from './renderables/misc/ping.js';
import { observable } from 'mobx';

const GetContext = canvas => {
  var context = canvas.getContext('2d');
  context.canvas.width = canvas.clientWidth;
  context.canvas.height = canvas.clientHeight;
  return context;
};

const RenderText = (context, string, size) => {
  context.font = `bold ${size}px serif`;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.fillText(
    string,
    context.canvas.width / 2,
    context.canvas.height * 0.55
  );
};

const DMGate = context => {
  if (!GameRoom.dm && GameRoom.hidden) {
    context.fillStyle = 'black';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillStyle = 'white';
    RenderText(context, 'DM is working on something...', 32);
    return false;
  }
  return true;
};

const GameGate = context => {
  if (!GameRoom.board) {
    context.fillStyle = 'black';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillStyle = 'white';
    RenderText(context, 'No Current Game, Please Wait...', 32);
    return false;
  }
  return true;
};

class RendererSingleton {
  @observable dirty = false;

  frames = 0;
  fps = 0;
  frame_time = 0;
  Render = (canvas, render_context) => {
    GameRoom.CheckState();
    if (!this.dirty || !canvas) return;
    this.dirty = false;
    const context = canvas.getContext('2d');

    this.frames++;
    const now = Date.now();
    const delta = (now - this.frame_time) / 1000;
    if (delta > 0.5) {
      this.fps = this.frames / delta;
      this.frames = 0;
      this.frame_time = now;
    }

    if (!DMGate(context) || !GameGate(context)) {
      return;
    }

    GameRoom.board.Draw(context, render_context);

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

    Ping.DrawAll(context, render_context);
  };
}

export const Renderer = new RendererSingleton();
export const MiniMapRenderer = new RendererSingleton();
