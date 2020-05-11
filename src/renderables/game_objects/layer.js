import { observable } from 'mobx';
import LayerImage from './layer_image';
import Token from './token';
import { LoadIntoArray } from '../misc/common';
import GroundEffects from '../misc/ground_effects';
import Fog from '../misc/fog';
import { GameRoom } from '../../gameroom';

let layer_count = 0;

export default class Layer {
  key = layer_count++;
  @observable name = `No Layer Name ${this.key}`;
  @observable description = 'No Layer Description';
  @observable visible = true;
  @observable background = new LayerImage();
  @observable background_dm = new LayerImage();
  @observable use_dm = false;
  @observable grid = { width: 33, height: 45 };
  @observable fog = new Fog(10, 10);
  @observable effects = new GroundEffects();
  @observable tokens = [];

  canvas = document.createElement('canvas');

  Load(raw) {
    if (raw.name != undefined) {
      this.name = raw.name;
    }
    if (raw.visible != undefined) {
      this.visible = raw.visible;
    }
    if (raw.background != undefined) {
      this.background.Load(raw.background);
    }
    if (raw.background_dm != undefined) {
      this.background_dm.Load(raw.background_dm);
    }

    if (raw.fog != undefined) {
      this.fog.Load(raw.fog);
    }
    if (raw.effects != undefined) {
      this.effects.Load(raw.effects);
    }
    if (raw.tokens != undefined) {
      this.tokens = LoadIntoArray(this.tokens, raw.tokens, Token);
    }
  }

  Save() {
    return {
      name: this.name,
      description: this.description,
      visible: this.visible,
      background: this.background.Save(),
      background_dm: this.background_dm.Save(),
      fog: this.fog.Save(),
      effects: this.effects.Save(),
      tokens: this.tokens.map(t => t.Save()),
    };
  }

  static CreateDefault() {
    var layer = new Layer();
    // layer.background.url = ;;
    return layer;
  }

  Draw = context => {
    if (!this.visible) {
      return;
    }

    const width = context.canvas.width;
    const height = context.canvas.height;

    // Resize context
    const layer_context = this.canvas.getContext('2d');
    layer_context.canvas.width = width;
    layer_context.canvas.height = height;

    if (GameRoom.dm && this.use_dm) {
      this.background.ready;
      this.background_dm.Draw(layer_context);
    } else {
      this.background.Draw(layer_context);
    }

    // layer tokens
    this.tokens.forEach(t => t.Draw(layer_context));

    this.effects.Draw(layer_context);
    this.fog.Draw(layer_context);

    // Add in grid_offset here
    // Complicated since tokens are drawn in layer-space... TBD
    context.drawImage(layer_context.canvas, 0, 0);
  };

  get index() {
    return GameRoom.board.layers.findIndex(l => l.key == this.key);
  }

  // UI
  OnActivate = () => (GameRoom.board.layer_id = this.index);
  OnDelete = () => GameRoom.DeleteLayer(this.index);
  OnMoveUp = () => GameRoom.MoveLayer(this.index, -1);
  OnMoveDown = () => GameRoom.MoveLayer(this.index, 1);
  ToggleVisible = () => (this.visible = !this.visible);

  OnNameChange = event => (this.name = event.target.value);
  OnDescriptionChange = event => (this.description = event.target.value);
}
