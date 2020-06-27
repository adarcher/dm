import { GameRoom } from './gameroom';
import Ping from './renderables/misc/ping.js';
import { observable } from 'mobx';
import { RenderContext } from './render_info.js';
import { PPI } from './misc/constants.js';
import { Diff } from './renderables/misc/common';

const GetContext = canvas => {
  var canvas_context = canvas.getContext('2d');
  canvas_context.canvas.width = canvas.clientWidth;
  canvas_context.canvas.height = canvas.clientHeight;
  return canvas_context;
};

const RenderText = (canvas_context, string, size) => {
  canvas_context.font = `bold ${size}px serif`;
  canvas_context.textBaseline = 'middle';
  canvas_context.textAlign = 'center';
  canvas_context.fillText(
    string,
    canvas_context.canvas.width / 2,
    canvas_context.canvas.height * 0.55
  );
};

const DMGate = canvas_context => {
  if (!GameRoom.dm && GameRoom.hidden) {
    canvas_context.fillStyle = 'black';
    canvas_context.fillRect(
      0,
      0,
      canvas_context.canvas.width,
      canvas_context.canvas.height
    );
    canvas_context.fillStyle = 'white';
    RenderText(canvas_context, 'DM is working on something...', 32);
    return false;
  }
  return true;
};

const GameGate = canvas_context => {
  if (!GameRoom.board) {
    canvas_context.fillStyle = 'black';
    canvas_context.fillRect(
      0,
      0,
      canvas_context.canvas.width,
      canvas_context.canvas.height
    );
    canvas_context.fillStyle = 'white';
    RenderText(canvas_context, 'No Current Game, Please Wait...', 32);
    return false;
  }
  return true;
};

class RendererSingleton {
  @observable dirty = false;

  // Held Widgets
  @observable widgets = [];
  @observable held = [];

  @observable fog_color = 'black';

  @observable screen_info = new RenderContext();
  @observable minimap_info = new RenderContext({
    ping: { size: 5, min: 1, max: 1 },
  });

  GetScreenContext = () => ({
    info: this.screen_info,
  });
  GetMinimapContext = () => ({
    info: this.minimap_info,
  });

  RenderScreen = canvas => this.Render(canvas, this.screen_info);
  RenderMinimap = canvas => this.Render(canvas, this.minimap_info);

  // frames = 0;
  // fps = 0;
  // frame_time = 0;

  SetDirty = (dirty = true) => {
    this.screen_info.dirty = this.screen_info.dirty || dirty;
    this.minimap_info.dirty = this.minimap_info.dirty || dirty;
  };

  Render = (canvas, render_context) => {
    // if (render_context == this.screen_info) {
    this.SetDirty(GameRoom.CheckState());
    this.CheckState();
    // }
    if (!render_context.dirty || !canvas) return;
    render_context.dirty = false;
    const canvas_context = GetContext(canvas); //canvas.getContext('2d');

    console.log('render');

    // render_context.frames++;
    // const now = Date.now();
    // const delta = (now - render_context.frame_time) / 1000;
    // if (delta > 0.5) {
    //   render_context.fps = render_context.frames / delta;
    //   render_context.frames = 0;
    //   render_context.frame_time = now;
    // }

    if (!DMGate(canvas_context) || !GameGate(canvas_context)) {
      return;
    }

    const context = {
      canvas: canvas_context,
      info: render_context,
      fog: { color: this.fog_color },
    };

    GameRoom.board.Draw(context);

    this.widgets.forEach(widget => widget.Draw(context));

    GameRoom.tokens.forEach(token => token.DrawOver(context));

    Ping.DrawAll(context);
  };

  UIState() {
    return {
      zoom: this.screen_info.zoom,
      widgets: this.widgets.map(w => w.UIState()),
      tokens: GameRoom.tokens.map(t => t.UIState()),
    };
  }

  previous_ui_state = false;
  CheckState = () => {
    if (Ping.ping_cache.length > 0) {
      this.SetDirty();
    }
    const current_ui_state = this.UIState();
    current_ui_state.pings = Ping.ping_cache.length;
    if (this.previous_ui_state) {
      const diff = Diff(this.previous_ui_state, current_ui_state, false);
      if (diff) {
        this.SetDirty();
      }
    }

    this.previous_ui_state = current_ui_state;
  };

  CenterOnGrid(center) {
    const pixel_center = {
      x: center.x * PPI,
      y: center.y * PPI,
    };

    this.screen_info.UpdateOffsetFromCenter(pixel_center);
    this.minimap_info.UpdateOffsetFromCenter(pixel_center);
  }

  Update(context, up) {
    this.screen_info.Update(context, up);
    this.minimap_info.Update(context, up);
  }

  setZoom(val) {
    this.screen_info.setZoom(val);
    this.minimap_info.setZoom(val);
  }
}

export const Renderer = new RendererSingleton();
// export const MiniMapRenderer = new RendererSingleton();
