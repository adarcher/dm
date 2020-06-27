import { observable } from 'mobx';
import { PPI } from '../../misc/constants';
import Grabbable from './grabbable';

@Grabbable
export class Guide {
  onChange = false;
  vertical = true;
  constructor(value, ppi, offset, vertial, onChange = () => {}) {
    this._value = value;
    this.vertical = vertial;
    this.ppi = ppi;
    this.offset = offset;
    this.onChange = onChange;
  }
  // Value is in image coords, so it must be zoom'd and offset by image stats
  // This makes it a little complicated, probably should be on a layer to get
  // access to those readily
  //
  // Only used in Edit though
  @observable _value = 0;
  color = 'red';
  ppi = PPI;
  offset = 0;

  get value() {
    return this._value;
  }
  set value(val) {
    this._value = val;
    if (!this.over) {
      this.onChange();
    }
  }

  Position(context) {
    const zoomed = context.info.Zoom(
      ((this.value - this.offset) * PPI) / this.ppi
    );
    if (this.vertical) {
      const offset = context.info.offset.x;
      return offset + zoomed;
    } else {
      const offset = context.info.offset.y;
      return offset + zoomed;
    }
  }

  Draw(context) {
    if (this.visible) {
      context.canvas.save();

      const width = Math.max(1, context.info.Zoom(1));
      const position = this.Position(context);
      context.canvas.lineWidth = width;
      let x = 0;
      let y = position - width;
      let w = context.canvas.canvas.width;
      let h = 2 * width;
      if (this.vertical) {
        x = position - width;
        y = 0;
        w = 2 * width;
        h = context.canvas.canvas.height;
      }
      if (this.over) {
        context.canvas.shadowColor = 'rgba(255,255,255,.5)';
        context.canvas.shadowBlur = 1;
        context.canvas.lineWidth = 2 * width;
        context.canvas.strokeStyle = 'rgba(255,255,255,.5)';
        context.canvas.strokeRect(x, y, w, h);
        context.canvas.shadowBlur = 0;
      }
      context.canvas.lineWidth = width;
      context.canvas.strokeStyle = this.color;
      context.canvas.strokeRect(x, y, w, h);

      context.canvas.restore();
    }
  }

  Over(context) {
    const width = Math.max(1, context.info.Zoom(1));
    const position = this.Position(context);
    if (this.vertical) {
      this.over =
        context.location.x >= position - width &&
        context.location.x <= position + width;
    } else {
      this.over =
        context.location.y >= position - width &&
        context.location.y <= position + width;
    }
    return this.over;
  }

  MoveTo(context) {
    const location = this.vertical
      ? context.info.UnZoom(context.location.x - context.info.offset.x)
      : context.info.UnZoom(context.location.y - context.info.offset.y);
    this.value = (location * this.ppi) / PPI + this.offset;
  }

  Drop(context) {
    this.onChange(context);
  }

  UIState() {
    return {
      over: this.over ? 'on' : 'off',
      value: this.value,
    };
  }
}
