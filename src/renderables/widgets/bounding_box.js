import { RenderInfo } from '../../render_info';

import Grabbable from './grabbable';
import HorizontalDimension from './horizontal_dimension';
import VerticalDimension from './vertical_dimension';
import { ImageSource, SourceState } from '../game_objects/image_source';

@Grabbable
export default class BoundingBox {
  constructor() {
    this.vertical = new HorizontalDimension();
    this.horizontal = new VerticalDimension();
  }

  FromLayer(layer) {
    var ini = ImageSource(layer.background.url);
    if (ini.state == SourceState.Loaded) {
      this.vertical.FromLayer(layer);
      this.horizontal.FromLayer(layer);
      this.visible = true;
    } else {
      this.visible = false;
    }
  }

  Over(coord) {
    this.vertical.Over(coord);
    this.horizontal.Over(coord);
    this.over = this.vertical.over || this.horizontal.over;
    return this.over;
  }

  MoveTo(coord) {
    if (this.vertical.over) {
      this.vertical.MoveTo(coord);
    }
    if (this.horizontal.over) {
      this.horizontal.MoveTo(coord);
    }
  }

  Drop() {
    this.vertical.Drop();
    this.horizontal.Drop();
  }

  OverLocation() {
    var dimension = this.vertical.over ? this.vertical : this.horizontal;
    var guide = dimension.lower.over ? dimension.lower : dimension.upper;
    if (guide.vertical) {
      return {
        x: guide.Position(),
        y: RenderInfo.mouse.y,
      };
    } else {
      return {
        x: RenderInfo.mouse.x,
        y: guide.Position(),
      };
    }
  }

  // Draw text for the grid count between lower/upper
  DrawGridCount(context) {
    context.save();
    const location = this.OverLocation();
    const grid_count = this.vertical.over
      ? this.horizontal.grid_count
      : this.vertical.grid_count;
    const text_height = 24;
    const padding = 2;
    context.font = `${text_height}px Verdana`;
    context.textBaseline = 'ideographic';
    context.fillStyle = 'red';
    const t = context.measureText(grid_count);
    const rect = {
      x: location.x - t.width / 2 - padding,
      y: location.y - text_height - padding,
      width: t.width + 2 * padding,
      height: text_height + 2 * padding,
    };
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    context.fillStyle = 'white';
    const text = { x: rect.x + padding, y: location.y };
    context.fillText(grid_count, text.x, text.y);

    context.restore();
  }

  Draw(context) {
    if (this.visible) {
      this.vertical.Draw(context);
      this.horizontal.Draw(context);
      // One of the two has the mouse over it, not both or none
      if (this.vertical.over != this.horizontal.over) {
        this.DrawGridCount(context);
      }
    }
  }

  UIState() {
    return {
      visible: this.visible,
      v: this.vertical.UIState(),
      h: this.horizontal.UIState(),
    };
  }
}
