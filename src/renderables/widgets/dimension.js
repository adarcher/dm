import { observable } from 'mobx';
import { GameRoom } from '../../gameroom';
import Grabbable from './grabbable';
import { Guide } from './guide';

@Grabbable
export default class Dimension {
  lower = new Guide();
  upper = new Guide();
  @observable grid_count = 0;

  Over(context) {
    this.lower.Over(context);
    this.upper.Over(context);
    this.over = this.lower.over || this.upper.over;
    return this.over;
  }

  MoveTo(context) {
    if (this.lower.over) {
      this.lower.MoveTo(context);
    } else if (this.upper.over) {
      this.upper.MoveTo(context);
    }
  }

  Pickup(context) {}

  Draw(context) {
    if (this.visible) {
      this.lower.Draw(context);
      this.upper.Draw(context);
    }
  }

  Drop(context) {
    //test
    const delta = Math.max(1, this.upper.value - this.lower.value);
    const [extent, grid_count] = this.Extents();
    this.grid_count = Math.max(1, Math.round((grid_count * delta) / extent));
    const ppi = delta / this.grid_count;
    this.lower.ppi = ppi;
    this.upper.ppi = ppi;
    const offset = ((this.lower.value + ppi / 2) % ppi) - ppi / 2;
    this.lower.offset = offset;
    this.upper.offset = offset;

    // var layer = GameRoom.layer;
    // this.UpdateImageInfo(layer.background, ppi, offset);
    // this.UpdateImageInfo(layer.background_dm, ppi, offset);
    GameRoom.board.layers.forEach(l => {
      this.UpdateImageInfo(l.background, ppi, offset);
      this.UpdateImageInfo(l.background_dm, ppi, offset);
    });
  }

  UIState() {
    return {
      u: this.upper.UIState(),
      l: this.lower.UIState(),
    };
  }
}
