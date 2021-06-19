import { observable } from 'mobx';
import Layer from './layer';
import { LoadIntoArray } from '../misc/common';
import { GameRoom } from '../../gameroom';
import { GridSizer } from '../widgets/grid_sizer';
import { Grid } from '../../misc/grid';
import { Renderer } from '../../renderer';

let board_count = 0;
export default class Board {
  key = board_count++;
  @observable name = `No Board Name ${this.key}`;
  @observable description = 'No Board Description';
  // Stored in render order: bottom to top
  @observable layers = [new Layer()];
  @observable _layer_id = 0;
  @observable tags = [];
  @observable distance_step = 5;
  @observable grid_on = true;

  get layer_id() {
    return this._layer_id;
  }
  set layer_id(id) {
    let layer = this.ActiveLayer();
    if (layer) {
      layer.active = false;
    }
    this._layer_id = id;
    layer = this.ActiveLayer();
    if (GameRoom.dm) GridSizer.FromLayer(GameRoom.layer);
  }

  ActiveLayer() {
    if (this.layers[this._layer_id]) {
      const layer = this.layers[this._layer_id]
      layer.active = true
      return layer
    }
    return false
  }

  focus = { x: 0, y: 0 };

  Load(raw) {
    if (raw.name != undefined) {
      this.name = raw.name;
    }
    if (raw.description != undefined) {
      this.description = raw.description;
    }
    if (raw.tags != undefined) {
      // Check if this ruins mobx
      this.tags = raw.tags;
    }
    if (raw.layers != undefined) {
      this.layers = LoadIntoArray(this.layers, raw.layers, Layer);
    }
    if (raw.focus != undefined) {
      if (raw.focus.x) this.focus.x = raw.focus.x;
      if (raw.focus.y) this.focus.y = raw.focus.y;
    }
    if (raw.layer_id != undefined) {
      this.layer_id = raw.layer_id;
    }
    if (raw.distance_step != undefined) {
      this.distance_step = raw.distance_step;
    }
    if (raw.grid_on != undefined) {
      this.grid_on = raw.grid_on;
    }

    return this;
  }

  Save() {
    return {
      name: this.name,
      description: this.description,
      tags: this.tags.slice(),
      focus: { x: this.focus.x, y: this.focus.y },
      layers: this.layers.map(l => l.Save()),
      layer_id: this.layer_id,
      distance_step: this.distance_step,
      grid_on: this.grid_on,
    };
  }

  Draw(context) {
    this.layers.forEach(l => l.Draw(context));

    if (this.grid_on) {
      Grid(context);
    }
  }

  get index() {
    return GameRoom.boards.findIndex(l => l.key == this.key);
  }

  // UI
  OnDelete = () => GameRoom.DeleteBoard(this.index);
  OnActivate = () => (GameRoom.board_id = this.index);
  OnNameChange = event => (this.name = event.target.value);
  OnDescriptionChange = event => (this.description = event.target.value);

  Focus = () => Renderer.CenterOnGrid(this.focus);
}
