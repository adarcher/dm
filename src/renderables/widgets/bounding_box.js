import Grabbable from './grabbable';
import HorizontalDimension from './horizontal_dimension';
import VerticalDimension from './vertical_dimension';
import { ImageSource } from '../game_objects/image_source';

@Grabbable
export default class BoundingBox {
  constructor() {
    this.vertical = new HorizontalDimension();
    this.horizontal = new VerticalDimension();
  }

  FromLayer(layer) {
    var ini = ImageSource.Get(layer.background.url);
    if (ini.valid) {
      this.vertical.FromLayer(layer);
      this.horizontal.FromLayer(layer);
      this.visible = true;
    } else {
      this.visible = false;
    }
  }

  Over(context) {
    this.vertical.Over(context);
    this.horizontal.Over(context);
    this.over = this.vertical.over || this.horizontal.over;
    return this.over;
  }

  MoveTo(context) {
    if (this.vertical.over) {
      this.vertical.MoveTo(context);
    }
    if (this.horizontal.over) {
      this.horizontal.MoveTo(context);
    }
  }

  Drop(context) {
    this.vertical.Drop(context);
    this.horizontal.Drop(context);
  }

  OverLocation(context) {
    var dimension = this.vertical.over ? this.vertical : this.horizontal;
    var guide = dimension.lower.over ? dimension.lower : dimension.upper;
    if (guide.vertical) {
      return {
        x: guide.Position(context),
        y: context.info.mouse.y,
      };
    } else {
      return {
        x: context.info.mouse.x,
        y: guide.Position(context),
      };
    }
  }

  // Draw text for the grid count between lower/upper
  DrawGridCount(context) {
    context.canvas.save();
    const location = this.OverLocation(context);
    const grid_count = this.vertical.over
      ? this.horizontal.grid_count
      : this.vertical.grid_count;
    const text_height = 24;
    const padding = 2;
    context.canvas.font = `${text_height}px Verdana`;
    context.canvas.textBaseline = 'ideographic';
    context.canvas.fillStyle = 'red';
    const t = context.canvas.measureText(grid_count);
    const rect = {
      x: location.x - t.width / 2 - padding,
      y: location.y - text_height - padding,
      width: t.width + 2 * padding,
      height: text_height + 2 * padding,
    };
    context.canvas.fillRect(rect.x, rect.y, rect.width, rect.height);
    context.canvas.fillStyle = 'white';
    const text = { x: rect.x + padding, y: location.y };
    context.canvas.fillText(grid_count, text.x, text.y);

    context.canvas.restore();
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
