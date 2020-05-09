import { action } from 'mobx';
import { GameRoom } from '../../gameroom';
import Dimension from './dimension';

export default class VerticalDimension extends Dimension {
  constructor() {
    super();
    this.lower.vertical = false;
    this.upper.vertical = false;
  }

  @action
  FromLayer(layer) {
    const min = layer.background.offset.y;
    const ppi = layer.background.ppi.y;
    const height = layer.grid.height;
    const max = min + height * ppi;
    this.grid_count = height;
    this.lower.ppi = ppi;
    this.lower.value = min;
    this.lower.offset = min;
    this.upper.ppi = ppi;
    this.upper.value = max;
    this.upper.offset = min;
    // TODO: bug may be introduced in the set value() triggering onChange()
  }

  Extents() {
    var layer = GameRoom.layer;
    const size = layer.background.size;
    const height = size.height || 10;
    return [height, layer.grid.height];
  }

  UpdateImageInfo(image, ppi, offset) {
    image.ppi.y = ppi;
    image.offset.y = offset;
  }
}
