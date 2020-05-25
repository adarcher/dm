import { action, observable } from 'mobx';

import { PPI } from './misc/constants.js';
import { Wall } from './misc/wall.js';
import Blur from './renderables/blur.js';
import { GameRoom } from './gameroom';
import { Diff } from './renderables/misc/common.js';
import { Renderer } from './renderer.js';

class RenderContext {
  // export default class RenderInfo {
  // For resizing only so far
  constructor() {
    this.Resize();

    if (window) {
      window.addEventListener('resize', this.Resize);
    }
  }

  Resize = () => {
    this.center_arm = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.UpdateOffsetFromCenter(this.center);
    if (Renderer) Renderer.dirty = true;
  };
  // End constuctor stage

  // Observables declared/defined first
  // Grid mouse is currently over
  @observable current_grid = { x: 0, y: 0 };
  // Current zoom level, 1 == 96ppi grid
  @observable zoom = 0.4;
  // The current grid is divided into 25 sections, this is the coord inside the
  // grid: 0,0 is top left
  @observable current_sub_grid = { x: 0, y: 0 };
  // Wall accosiated with current_sub_grid
  @observable current_wall = Wall.None;
  // Saved off value of grid width
  @observable grid_delta = PPI * this.zoom;
  // The offset in client pixels to start <0,0> for the grid
  @observable grid_start = { x: 0, y: 0 };
  @observable grid_location = { x: 0, y: 0 };
  grid_center = { x: 0, y: 0 };
  // The offset everything draw from
  @observable offset = { x: 0, y: 0 };
  // The rendered coordinates of the center of the screen
  // When comparing to a background image: center/96 * img.ppi
  @observable center = { x: 0, y: 0 };
  @observable center_arm = { x: 0, y: 0 };
  width = 0;
  height = 0;
  // Mouse location
  @observable mouse = { x: 0, y: 0 };
  mouse_zoom = { x: 0, y: 0 };

  location = { x: 0, y: 0 };

  hidden = false;

  // Not used
  @observable rotation = 90;
  @observable grid_on = true;

  // Extras
  @observable extras = [];
  @observable fog_color = 'black';

  // Held Widgets
  @observable widgets = [];
  @observable held = [];

  // Pings
  @observable pings = [];

  // Animation variables
  animation_start_time = 0;
  animation_length = 0;
  animation_start = { x: 0, y: 0 };
  animation_destination = { x: 0, y: 0 };
  animation_delta = { x: 0, y: 0 };
  animating = false;
  animation_frame_id = false;
  animation_timeout_id = false;

  pan_to_point = false;
  // Internal

  Zoom(val) {
    return val * this.zoom;
  }
  UnZoom(val) {
    return val / this.zoom;
  }

  setZoom(val) {
    this.location = {
      x: this.UnZoom(this.center_arm.x - this.offset.x),
      y: this.UnZoom(this.center_arm.y - this.offset.y),
    };

    this.Update(
      {
        x: this.center_arm.x,
        y: this.center_arm.y,
        cx: this.center_arm.x,
        cy: this.center_arm.y,
      },
      val
    );
  }

  @action
  Update(mouse, zoom = undefined) {
    if (mouse) {
      this.mouse = mouse;

      this.center_arm.x = mouse.cx;
      this.center_arm.y = mouse.cy;
      this.width = 2 * this.center_arm.x;
      this.height = 2 * this.center_arm.y;

      this.center = {
        x: Math.round(this.UnZoom(mouse.cx - this.offset.x)),
        y: Math.round(this.UnZoom(mouse.cy - this.offset.y)),
      };
    }
    this.width = 2 * this.center_arm.x;
    this.height = 2 * this.center_arm.y;

    // First check Zoom
    if (zoom != undefined) {
      if (typeof zoom === 'boolean') {
        if (zoom) {
          this.zoom *= 1.1;
        } else {
          this.zoom /= 1.1;
        }
      } else {
        this.zoom = zoom;
      }
      // Cap zooming
      this.zoom = Math.max(0.0001, this.zoom);
      this.zoom = Math.min(10000, this.zoom);

      this.grid_delta = this.Zoom(PPI);
      this.offset = {
        x: mouse.x - this.Zoom(this.location.x),
        y: mouse.y - this.Zoom(this.location.y),
      };
    } else if (this.pan_offset) {
      const pan_delta = {
        x: this.pan_offset.offset.x - this.pan_offset.pan_from.x,
        y: this.pan_offset.offset.y - this.pan_offset.pan_from.y,
      };

      const x = Math.round(pan_delta.x + mouse.x);
      const y = Math.round(pan_delta.y + mouse.y);

      if (x != this.offset.x && y != this.offset.y) {
        this.offset = {
          x: x,
          y: y,
        };
      }
    }

    this.location = {
      x: this.UnZoom(mouse.x - this.offset.x),
      y: this.UnZoom(mouse.y - this.offset.y),
    };
    {
      const x = Math.floor(this.location.x / PPI);
      const y = Math.floor(this.location.y / PPI);
      if (this.current_grid.x != x) {
        this.current_grid.x = x;
        this.grid_location.x = this.offset.x + x * this.grid_delta;
      }
      if (this.current_grid.y != y) {
        this.current_grid.y = y;
        this.grid_location.y = this.offset.y + y * this.grid_delta;
      }
    }

    this.grid_center = {
      x: Math.round(this.center.x / PPI),
      y: Math.round(this.center.y / PPI),
    };

    if (GameRoom) {
      var board = GameRoom.board;
      if (board) {
        board.focus.x = this.center.x / PPI;
        board.focus.y = this.center.y / PPI;
      }
    }

    // 0-4 == 5 sections each way, 25 per grid
    {
      const x = Math.floor(((this.location.x % PPI) / PPI) * 5);
      const y = Math.floor(((this.location.y % PPI) / PPI) * 5);
      if (this.current_sub_grid.x != x) {
        this.current_sub_grid.x = x;
      }
      if (this.current_sub_grid.y != y) {
        this.current_sub_grid.y = y;
      }
    }
    // Wall section is from subgrid
    let wall = Wall.None;
    if (this.current_sub_grid.y == 0) wall = Wall.North;
    if (this.current_sub_grid.y == 4) wall = Wall.South;
    if (this.current_sub_grid.x == 0) wall = Wall.West;
    if (this.current_sub_grid.x == 4) wall = Wall.East;

    if (this.current_wall != wall) {
      this.current_wall = wall;
    }

    {
      const x = this.offset.x % this.grid_delta;
      const y = this.offset.y % this.grid_delta;
      if (this.grid_start.x != x) {
        this.grid_start.x = x;
      }
      if (this.grid_start.y != y) {
        this.grid_start.y = y;
      }
    }
  }

  @action AnimateStep = () => {
    const now = Date.now();
    const progress = Math.min(
      1,
      (now - this.animation_start_time) / this.animation_length
    );

    const new_center = {
      x: this.animation_start.x + this.animation_delta.x * progress,
      y: this.animation_start.y + this.animation_delta.y * progress,
    };

    this.UpdateOffsetFromCenter(new_center);

    if (progress <= 1) {
      this.animation_frame_id = window.requestAnimationFrame(this.AnimateStep);
    } else {
      this.animating = false;
    }
  };

  CancelAnimation() {
    window.cancelAnimationFrame(this.animation_frame_id);
    this.pan_to_point = false;
  }

  AnimateTo = (center, time) => {
    this.CancelAnimation();
    this.animation_start_time = Date.now();
    this.animation_length = time;
    this.animation_destination = center;
    this.animation_start = Object.assign({}, this.center);

    this.animation_delta = {
      x: this.animation_destination.x - this.animation_start.x,
      y: this.animation_destination.y - this.animation_start.y,
    };

    this.pan_to_point = center;

    this.animating = true;
    this.animation_frame_id = window.requestAnimationFrame(this.AnimateStep);
  };

  UpdateOffsetFromCenter(center) {
    this.offset.x = this.center_arm.x - this.zoom * center.x;
    this.offset.y = this.center_arm.y - this.zoom * center.y;

    this.center.x = center.x;
    this.center.y = center.y;

    this.Update(false);
    // this.grid_start.x = this.offset.x % this.grid_delta;
    // this.grid_start.y = this.offset.y % this.grid_delta;
  }

  UpdateCenterFromOffset(offset) {
    this.center.x = (this.center_arm.x - offset.x) / this.zoom;
    this.center.y = (this.center_arm.y - offset.y) / this.zoom;

    this.offset.x = offset.x;
    this.offset.y = offset.y;
    this.Update(false);
  }

  CenterOnGrid(center) {
    this.UpdateOffsetFromCenter({
      x: center.x * PPI,
      y: center.y * PPI,
    });
  }

  ExitMode() {
    this.CancelAnimation();
    this.extras = [];
    this.fog_color = 'black';
  }

  // Extras
  // Screen Blur
  @observable blur = new Blur();
  AddBlur(radius) {
    this.RemoveBlur();
    this.blur.spread = radius;
    // Note.  This will put blur on top.  Currently it's only used on Welcome,
    // so not a problem.  If otherwise, reevaluate.
    this.extras.push(this.blur);
  }
  RemoveBlur() {
    this.extras = this.extras.filter(extra => extra != this.blur);
  }

  UIState() {
    return {
      zoom: this.zoom,
      grid: this.grid_on,
      widgets: this.widgets.map(w => w.UIState()),
      tokens: GameRoom.tokens.map(t => t.UIState()),
    };
  }

  previous_ui_state = false;
  CheckState = () => {
    const now = Date.now();
    if (this.pings.length > 0) {
      this.pings = this.pings.filter(p => p.end > now);
      Renderer.dirty = true;
    }
    const current_ui_state = this.UIState();
    if (this.previous_ui_state) {
      const diff = Diff(this.previous_ui_state, current_ui_state, false);
      if (diff) {
        Renderer.dirty = true;
      }
    }

    this.previous_ui_state = current_ui_state;
  };
}

export const RenderInfo = new RenderContext();
export const MiniMapInfo = new RenderContext();
