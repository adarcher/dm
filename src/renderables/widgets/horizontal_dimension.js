import { action } from 'mobx';
import { GameRoom } from '../../gameroom';
import Dimension from './dimension';

export default class HorizontalDimension extends Dimension {
  constructor() {
    super();
    this.lower.vertical = true;
    this.upper.vertical = true;
  }

  @action
  FromLayer(layer) {
    const min = layer.background.offset.x;
    const ppi = layer.background.ppi.x;
    const width = layer.grid.width;
    const max = min + width * ppi;
    this.grid_count = width;
    this.lower.ppi = ppi;
    this.lower.value = min;
    this.lower.offset = min;
    this.upper.ppi = ppi;
    this.upper.value = max;
    this.upper.offset = min;
  }

  Extents() {
    var layer = GameRoom.layer;
    const size = layer.background.size;
    const width = size.width || 10;
    return [width, layer.grid.width];
  }

  UpdateImageInfo(image, ppi, offset) {
    image.ppi.x = ppi;
    image.offset.x = offset;
  }
}
