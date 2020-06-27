import { observable } from 'mobx';
import Enum from '../misc/enum.js';
import { Wall } from '../misc/wall.js';
import { GameRoom } from '../gameroom';
import { GROUND_EFFECTS } from '../misc/constants.js';

export const BrushStyle = Enum(['Fog', 'Paint', 'None']);
export const BrushFogStyle = Enum(['Cover', 'Reveal']);

class BrushSingleton {
  @observable style = BrushStyle.None;
  @observable fog_style = BrushFogStyle.Cover;
  @observable paint_style = 'Clear';

  @observable radius = 1;
  minor_radius = 0;
  major_radius = 1;

  active = false;

  @observable visible = false;
  grid_color = '#40a5cc';
  wall_color = '#cdb742';

  get size() {
    return this.radius;
  }
  set size(val) {
    val = Math.max(1, val);
    this.radius = val;
    this.major_radius = Math.floor(val / 2);
    this.minor_radius = val - this.major_radius - 1;
  }

  DrawGhost(context) {
    context.canvas.strokeStyle = this.grid_color;
    context.canvas.globalAlpha = 0.75;
    context.canvas.lineWidth = context.info.Zoom(10);
    const delta = this.minor_radius * context.info.grid_delta;
    const x =
      context.info.offset.x +
      context.info.current_grid.x * context.info.grid_delta -
      delta;
    const y =
      context.info.offset.y +
      context.info.current_grid.y * context.info.grid_delta -
      delta;
    const size = this.radius * context.info.grid_delta;
    context.canvas.strokeRect(x, y, size, size);
  }

  DrawNearestWall(context) {
    context.canvas.fillStyle = this.wall_color;
    context.canvas.globalAlpha = 0.5;
    let x =
      context.info.offset.x +
      context.info.current_grid.x * context.info.grid_delta;
    let y =
      context.info.offset.y +
      context.info.current_grid.y * context.info.grid_delta;
    let width = context.info.grid_delta;
    let height = context.info.grid_delta;
    switch (context.info.current_wall) {
      case Wall.South: {
        y += 0.8 * context.info.grid_delta;
      }
      case Wall.North: {
        height = 0.2 * context.info.grid_delta;
        break;
      }
      case Wall.East: {
        x += 0.8 * context.info.grid_delta;
      }
      case Wall.West: {
        width = 0.2 * context.info.grid_delta;
        break;
      }
    }
    context.canvas.fillRect(x, y, width, height);
  }

  // For now, just always highlight the brush and the possible wall.
  Draw = context => {
    if (!this.visible) {
      return;
    }
    context.canvas.save();

    // Adds some depth, so it's more visible
    context.canvas.shadowColor = 'black';
    context.canvas.shadowBlur = 15;

    if (context.info.current_grid) {
      this.DrawGhost(context);
    }

    if (context.info.current_wall != Wall.None) {
      this.DrawNearestWall(context);
    }

    context.canvas.restore();
  };

  // Return if painting
  Paint(context) {
    if (this.active) {
      const cg = context.info.current_grid;
      switch (this.style) {
        case BrushStyle.Fog: {
          switch (this.fog_style) {
            case BrushFogStyle.Reveal: {
              GameRoom.fog.Remove(cg.x, cg.y, this.radius);
              break;
            }
            case BrushFogStyle.Cover: {
              GameRoom.fog.Add(cg.x, cg.y, this.radius);
              break;
            }
          }
          return true;
        }
        case BrushStyle.Paint: {
          if (this.paint_style == 'Clear') {
            GameRoom.ground_effects.Remove(cg.x, cg.y, this.radius);
          } else {
            const level =
              1 +
              Object.keys(GROUND_EFFECTS).findIndex(e => e == this.paint_style);
            GameRoom.ground_effects.Add(cg.x, cg.y, this.radius, level);
          }
          return true;
        }
      }
    }
    return false;
  }
}

export const Brush = new BrushSingleton();
