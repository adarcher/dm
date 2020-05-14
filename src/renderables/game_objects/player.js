import { observable } from 'mobx';
import Token, { TokenBase } from './token';
import { RenderInfo } from '../../render_info';
import { TOKEN_BORDER_WIDTH } from '../../misc/constants';
import { GameRoom } from '../../gameroom';

export default class Player extends TokenBase {
  //// In Feet
  // normal dim dark
  @observable vision = [240, 60, 0];
  // Movement
  @observable run = 30;
  @observable fly = 0;

  @observable show_vision = [false, false, false];
  @observable show_range = { run: true };

  static vision_colors = ['#FFFFFF', '#888888', '#000000'];
  static movement_colors = { run: '#88FF88', fly: '#8888FF' };

  get token() {
    return GameRoom.tokens.find(t => t.name == this.name);
  }

  Load(raw) {
    super.Load(raw);
    if (raw.vision != undefined) {
      this.vision = raw.vision;
    }
    if (raw.run != undefined) {
      this.run = raw.run;
    }
    if (raw.fly != undefined) {
      this.fly = raw.fly;
    }
    if (raw.color != undefined) {
      this.color = raw.color != '' ? raw.color : this.color;
    }

    return this;
  }

  Save() {
    var raw = super.Save();
    Object.assign(raw, {
      vision: this.vision,
      run: this.run,
      fly: this.fly,
      color: this.color,
    });
    return raw;
  }

  Draw(context, optional_location = false) {
    const token = this.token;
    if (token) {
      context.save();
      context.lineWidth = RenderInfo.zoom * TOKEN_BORDER_WIDTH;
      const rx = optional_location ? optional_location.x : token.x;
      const ry = optional_location ? optional_location.y : token.y;

      const val = this.run;
      const delta = RenderInfo.grid_delta;
      const radius = Math.floor(val / 5);
      const size = (2 * radius + 1) * delta;
      const x_offset = RenderInfo.offset.x;
      const y_offset = RenderInfo.offset.y;
      const x = Math.round((rx - radius) * delta + x_offset);
      const y = Math.round((ry - radius) * delta + y_offset);

      context.strokeStyle = Player.movement_colors.run;
      context.fillStyle = `${Player.movement_colors.run}44`;
      context.fillRect(x, y, size, size);
      context.strokeRect(x, y, size, size);

      // Object.keys(this.show_vision)
      //   .filter(f => this.show_vision[f])
      //   .forEach(i => {
      //     const val = this.vision[i];
      //     const delta = RenderInfo.grid_delta;
      //     const radius = Math.floor(val / 5);
      //     const size = (2 * radius + 1) * delta;
      //     const x_offset = RenderInfo.offset.x;
      //     const y_offset = RenderInfo.offset.y;
      //     const x = Math.round((token.x - radius) * delta + x_offset);
      //     const y = Math.round((token.y - radius) * delta + y_offset);

      //     context.strokeStyle = Player.vision_colors[i];
      //     context.fillStyle = `${Player.vision_colors[i]}44`;
      //     context.fillRect(x, y, size, size);
      //     context.strokeRect(x, y, size, size);
      //   });
      // Object.keys(this.show_range)
      //   .filter(f => this.show_range[f])
      //   .forEach(i => {
      //     const val = this[i];
      //     const delta = RenderInfo.grid_delta;
      //     const radius = Math.floor(val / 5);
      //     const size = (2 * radius + 1) * delta;
      //     const x_offset = RenderInfo.offset.x;
      //     const y_offset = RenderInfo.offset.y;
      //     const x = Math.round((token.x - radius) * delta + x_offset);
      //     const y = Math.round((token.y - radius) * delta + y_offset);

      //     context.strokeStyle = Player.movement_colors[i];
      //     context.fillStyle = `${Player.movement_colors[i]}44`;
      //     context.fillRect(x, y, size, size);
      //     context.strokeRect(x, y, size, size);
      //   });
      context.restore();
    }
  }

  AddToLayer = () => {
    var token = new Token();
    token.Load(this);
    token.MoveToCenter();
    GameRoom.tokens.push(token);
  };

  static LoadPlayer(name) {
    const key = `player: ${name}`;
    let raw = localStorage[key];
    if (raw) {
      raw = JSON.parse(raw);
    } else {
      raw = localStorage.player;
      //// V1 style
      //{ player: { name: name, url: url, size: size, color: color } }
      if (raw) {
        raw = JSON.parse(raw).player;
      } else {
        raw = GameRoom.player.Save();
      }
    }
    raw.name = name;
    GameRoom.player.Load(raw);

    this.SavePlayer(name);
  }

  static SavePlayer(name) {
    if (!name) name = GameRoom.player.name;
    const key = `player: ${name}`;
    const raw = GameRoom.player.Save();
    localStorage[key] = JSON.stringify(raw);
    localStorage.player_name = name;
    return raw;
  }

  static CachedPlayers() {
    const prefix = 'player: ';
    const prefix_l = prefix.length;
    let backup_names = Object.keys(localStorage)
      .filter(k => k.substring(0, prefix_l) == prefix)
      .map(k => k.substring(prefix_l));
    const old = localStorage.player;
    if (old && backup_names.length == 0) {
      backup_names.push(JSON.parse(old).player.name);
    }
    return backup_names;
  }

  static get LastUsedName() {
    return localStorage.player_name || '';
  }
}
