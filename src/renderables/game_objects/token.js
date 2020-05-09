import { observable, computed } from 'mobx';
import { RenderInfo } from '../../render_info';
import {
  ImageSource,
  PathSource,
  InitialsSource,
  SourceState,
} from './image_source';
import {
  GRID_WIDTH,
  TOKEN_BORDER_WIDTH,
  SVG_DUMMY,
} from '../../misc/constants';
import Grabbable from '../widgets/grabbable';
import { GameRoom } from '../../gameroom';

let token_count = 0;
export class TokenBase {
  key = token_count++;
  @observable name = `No Token Name ${this.key}`;
  @observable url = '';
  @observable path_info = {};
  @observable color = '#FF0000';
  @observable unique = true;

  @computed get source() {
    if (this.url) {
      var img = ImageSource(this.url);
      if (img.state == SourceState.Loaded) {
        return img;
      }
    } else if (this.path_info && this.path_info.path) {
      var ini = PathSource(this.path_info);
      if (ini.state == SourceState.Loaded) {
        return ini;
      }
    }
    return InitialsSource(this.name);
  }

  Load(raw) {
    if (raw.name) {
      this.name = raw.name;
    }
    if (raw.url) {
      this.url = raw.url;
    }
    if (raw.path_info) {
      this.path_info = raw.path_info;
    }
    if (raw.color) {
      this.color = raw.color;
    }
    if (raw.unique) {
      this.unique = raw.unique;
    }

    return this;
  }

  Save() {
    return {
      name: this.name,
      url: this.url,
      path_info: this.path_info,
      color: this.color,
      unique: this.unique,
    };
  }

  color_change_time = 0;
  OnChangeColor = event => {
    const now = Date.now();
    if (now - this.color_change_time > 33) {
      this.color_change_time = now;
      this.color = event.target.value;
    }
  };

  OnNameChange = event => (this.name = event.target.value);
}

@Grabbable
export default class Token extends TokenBase {
  @observable visible = true;
  @observable x = 0;
  @observable y = 0;
  @observable size = 1;

  Load(raw) {
    if (!this.locked) {
      super.Load(raw);
      if (raw.visible != undefined) {
        this.visible = raw.visible;
      }
      if (raw.x != undefined) {
        this.x = raw.x;
      }
      if (raw.y != undefined) {
        this.y = raw.y;
      }
      if (raw.size != undefined) {
        this.size = raw.size;
      }
    }

    return this;
  }

  Save() {
    var raw = super.Save();
    Object.assign(raw, {
      visible: this.visible,
      x: this.x,
      y: this.y,
      size: this.size,
    });
    return raw;
  }

  Path(context, line_width) {
    const delta = RenderInfo.grid_delta;
    const x_offset = RenderInfo.offset.x;
    const y_offset = RenderInfo.offset.y;
    const x = Math.round(this.x * delta + x_offset);
    const y = Math.round(this.y * delta + y_offset);
    const size = Math.ceil(this.size * delta);

    const radius = size / 2;
    context.beginPath();
    context.arc(
      x + radius,
      y + radius,
      radius - (RenderInfo.zoom * (line_width + GRID_WIDTH)) / 2,
      0,
      6.28,
      false
    );
    context.closePath();
  }

  Draw(context) {
    if (!GameRoom.dm && !this.visible) {
      return;
    }
    this.DrawPlayer(context);
    context.save();
    this.Path(context, TOKEN_BORDER_WIDTH);

    // Fill Color
    context.strokeStyle = this.color;
    context.fillStyle = this.color;
    context.globalAlpha = this.visible ? 1 : 0.5;
    context.fill();

    const delta = RenderInfo.grid_delta;
    const x_offset = RenderInfo.offset.x;
    const y_offset = RenderInfo.offset.y;
    const x = Math.round(this.x * delta + x_offset);
    const y = Math.round(this.y * delta + y_offset);
    const size = Math.ceil(this.size * delta);

    var patternCanvas = this.source.canvas;

    const major = Math.max(patternCanvas.width, patternCanvas.height);
    const aspect_offset_x =
      (size * ((major - patternCanvas.width) / major)) / 2;
    const aspect_offset_y =
      (size * ((major - patternCanvas.height) / major)) / 2;
    const scale = size / major;
    const pattern = context.createPattern(patternCanvas, 'no-repeat');
    pattern.setTransform(
      SVG_DUMMY.createSVGMatrix()
        .translate(x + aspect_offset_x, y + aspect_offset_y)
        .scale(scale)
    );
    context.fillStyle = pattern;

    // Fill Image
    context.fill();

    // Border
    context.lineWidth = RenderInfo.zoom * 5;
    context.shadowColor = 'black';
    context.shadowBlur = 10 * RenderInfo.zoom;
    context.stroke();

    context.restore();
  }

  // Grabbable
  held_offset = { x: 0, y: 0 };
  Over(mouse) {
    const layer_x = this.x || 0;
    const layer_y = this.y || 0;

    const x = RenderInfo.current_grid.x;
    const y = RenderInfo.current_grid.y;

    this.held_offset = {
      x: x - layer_x,
      y: y - layer_y,
    };

    this.over = !Object.values(this.held_offset).some(
      o => o < 0 || o > this.size - 1
    );
    return this.over;
  }

  pickup_location = false;
  Pickup(coord) {
    this.pickup_location = { x: this.x, y: this.y };
    this.Lock();
  }
  Drop() {
    this.pickup_location = false;
    setTimeout(() => this.Unlock(), 2000);
    // this.Unlock();
  }

  MoveTo(mouse) {
    this.x = RenderInfo.current_grid.x - this.held_offset.x;
    this.y = RenderInfo.current_grid.y - this.held_offset.y;
  }

  DrawOver(context) {
    if (!GameRoom.dm && !this.visible) {
      return;
    }
    if (this.over) {
      context.strokeStyle = this.color;
      this.Path(context, 0);
      context.globalAlpha = 1;
      context.lineWidth = 10 * RenderInfo.zoom;
      context.stroke();
    }
  }

  DrawPlayer(context) {
    if (!GameRoom.dm && !this.visible) {
      return;
    }
    if (this.over) {
      const player = GameRoom.player;
      if (player.name == this.name) {
        player.Draw(context, this.pickup_location);
      }
    }
  }

  // UI manips
  ToggleVisible = () => (this.visible = !this.visible);
  OnXChange = event => (this.x = event.target.value);
  OnYChange = event => (this.y = event.target.value);
  OnSizeChange = event => (this.size = Math.max(1, event.target.value));

  MoveToCenter = () => {
    const offset = Math.floor(this.size / 2);
    this.x = RenderInfo.grid_center.x - offset;
    this.y = RenderInfo.grid_center.y - offset;
  };

  CenterOn = () => {
    const offset = Math.floor(this.size / 2);
    RenderInfo.CenterOnGrid({
      x: this.x + offset,
      y: this.y + offset,
    });
  };

  // !!! These should only be called on tokens on the current layer
  // There are no checks for owning layer at the moment.
  Copy = () => {
    var new_token = new Token().Load(this);
    GameRoom.tokens.push(new_token);
  };

  Remove = () => {
    const index = GameRoom.tokens.findIndex(t => t == this);
    if (index >= 0) {
      GameRoom.tokens.splice(index, 1);
    }
  };

  // UI
  UIState = () => {
    return this.over;
  };
}
