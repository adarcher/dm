import { observable, action, computed } from 'mobx';
import { RenderInfo } from './render_info';
import Board from './renderables/game_objects/board';
import Player from './renderables/game_objects/player';
import { LoadIntoArray, Diff, Combine } from './renderables/misc/common';
import { LS_PREFIX, MAX_STATES, LS_BACKUP_COUNT } from './misc/constants';
import { Renderer } from './renderer';
import { Networking, NetworkLatency } from './networking/websocket';
import Layer from './renderables/game_objects/layer';

// There can only be one Room open per webpage, export a singleton
class GameRoomSingleton {
  constructor() {
    this.SubscribeToCheckState('RenderInfo', RenderInfo.CheckState);
  }

  // Stored full raw data
  room = undefined;

  // @observable dm = true;
  @observable hidden = false;

  @observable boards = [new Board()];
  @observable board_id = 0;

  @observable players = [new Player()];

  get player() {
    if (this.players.length == 0) {
      this.players.push(new Player());
    }
    return this.players[0];
  }

  @action
  Load(raw) {
    if (raw.boards) {
      this.boards = LoadIntoArray(this.boards, raw.boards, Board);
    }
    if (raw.board_id != undefined) {
      this.board_id = raw.board_id;
    }
    if (raw.id != undefined) {
      this.id = raw.id;
    }
    if (raw.hidden != undefined) {
      this.hidden = raw.hidden;
    }
  }

  Save() {
    return {
      boards: this.boards.map(b => b.Save()),
      board_id: this.board_id,
      hidden: this.hidden,
    };
  }

  SaveToDisk() {
    if (localStorage.gameroom) {
      const current_backup = localStorage[LS_BACKUP_COUNT] || 0;
      const next_backup = (current_backup + 1) % 10;
      localStorage[`${LS_PREFIX}${next_backup}`] = localStorage.gameroom;
    }
    localStorage.gameroom = JSON.stringify(this.Save());
  }

  LoadFromDisk() {
    try {
      this.Load(JSON.parse(localStorage.gameroom));
      this.SaveToDisk();
    } catch {
      console.log('LoadFromDisk(): No save data available');
    }
  }

  get board() {
    if (this.boards.length > this.board_id) {
      return this.boards[this.board_id];
    } else {
      return false;
    }
  }

  get distance_step() {
    const board = this.board;
    return board ? board.distance_step : 5;
  }

  get layer() {
    const board = this.board;
    if (board && board.layers.length > board.layer_id) {
      return board.layers[board.layer_id];
    } else {
      return false;
    }
  }

  get tokens() {
    const layer = this.layer;
    if (layer) {
      return layer.tokens;
    } else {
      return [];
    }
  }

  get fog() {
    const layer = this.layer;
    if (layer) {
      return layer.fog;
    } else {
      return false;
    }
  }

  get ground_effects() {
    const layer = this.layer;
    if (layer) {
      return layer.effects;
    } else {
      return false;
    }
  }

  // Margin is in %
  RandomU = (margin = 0.1) => {
    var board = this.board;
    const widths = board
      ? board.layers.map(l => l.background.ppi.x * l.grid.width)
      : [];
    const width = Math.max(100, ...widths);
    const left = width * margin;
    const zone = width * (1 - 2 * margin);
    return left + Math.random() * zone;
  };
  RandomV = (margin = 0.1) => {
    const board = this.board;
    const heights = board
      ? board.layers.map(l => l.background.ppi.y * l.grid.height)
      : [];
    const height = Math.max(100, ...heights);
    const top = height * margin;
    const zone = height * (1 - 2 * margin);
    return top + Math.random() * zone;
  };

  AddBoard = () => {
    this.boards.push(new Board());
  };

  @action
  DeleteBoard = id => {
    const active_board = this.boards[this.board_id];
    const active_id = active_board.index;
    this.boards.splice(id, 1);
    if (active_id != id) active_board.OnActivate();
    else this.board_id = Math.min(this.boards.length - 1, active_id);
  };

  AddLayer = () => {
    this.board.layers.push(new Layer());
  };

  @action
  DeleteLayer = id => {
    const board = this.board;
    const active_layer = board.layers[board.layer_id];
    const active_id = active_layer.index;
    board.layers.splice(id, 1);
    if (active_id != id) active_layer.OnActivate();
    else board.layer_id = Math.min(board.layers.length - 1, active_id);
  };

  MoveLayer = (id, delta) => {
    const new_id = id + delta;
    const board = this.board;
    if (id >= 0 && id < board.layers.length) {
      const active_layer = board.layers[board.layer_id];
      const layer = board.layers[id];
      board.layers.splice(id, 1);
      board.layers.splice(new_id, 0, layer);
      active_layer.OnActivate();
    }
  };

  RenderState() {
    const state = {
      board_id: 0,
      boards: this.board ? [this.board.Save()] : [],
      hidden: this.hidden,
      grid: RenderInfo.grid_on,
    };

    return state;
  }

  current_state_id = 0;
  states = [];
  previous_state = false;
  @action
  CheckState = () => {
    this.CheckStates();

    let changed = true;
    let current_state = this.RenderState();
    if (this.previous_state) {
      const diff = Diff(this.previous_state, current_state);
      if (diff) {
        diff.board_id = current_state.board_id;
      }
      const d_json = JSON.stringify(diff);
      const p_json = JSON.stringify(this.states[this.states.length - 1]);
      if (d_json != p_json) {
        this.states.push(diff);
      } else {
        changed = false;
      }
    } else {
      this.states.push(current_state);
    }

    if (changed) {
      Renderer.dirty = true;
      this.previous_state = current_state;

      const max = this.states.length;

      if (max > MAX_STATES) {
        this.states = [Combine(this.states)];
      }
      this.PublishStateChanged();
      this.current_state_id++;
    }

    [
      this.latency,
      this.latency_window,
      this.latency_size,
    ] = NetworkLatency.RTStat();
  };

  listeners = {};
  SubscribeToStateChange(name, func) {
    this.listeners[name] = func;
  }
  UnSubscribeToStateChange(name) {
    delete this.listeners[name];
  }
  PublishStateChanged() {
    // Object.values(this.listeners).forEach(f => f(this.previous_state));
    const state = this.states[this.states.length - 1];
    Object.values(this.listeners).forEach(f => f(state));
  }

  checkers = {};
  SubscribeToCheckState(name, func) {
    this.checkers[name] = func;
  }
  UnSubscribeToCheckState(name) {
    delete this.checkers[name];
  }
  CheckStates() {
    Object.values(this.checkers).forEach(f => f());
  }

  /// export ?

  Export = () => {
    var room_raw = this.Save();

    var data = JSON.stringify(room_raw);
    var filename = `${Networking.id}_host.json`;
    var pom = document.createElement('a');
    pom.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(data)
    );
    pom.setAttribute('download', filename);

    if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
    } else {
      pom.click();
    }
  };

  @observable latency = 0;
  @observable latency_window = NetworkLatency.window;
  @observable latency_size = 0;

  Focus = () => {
    const board = this.board;
    if (board) {
      RenderInfo.CenterOnGrid(board.focus);
    }
  };
}

export const GameRoom = new GameRoomSingleton();
