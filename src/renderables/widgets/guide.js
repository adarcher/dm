import { observable } from 'mobx';

import { PPI } from '../../misc/constants';
import { RenderInfo } from '../../render_info';

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

  Position() {
    const zoomed = RenderInfo.Zoom(
      ((this.value - this.offset) * PPI) / this.ppi
    );
    if (this.vertical) {
      const offset = RenderInfo.offset.x;
      return offset + zoomed;
    } else {
      const offset = RenderInfo.offset.y;
      return offset + zoomed;
    }
  }

  Draw(context) {
    if (this.visible) {
      context.save();

      const width = Math.max(1, RenderInfo.Zoom(1));
      const position = this.Position();
      context.lineWidth = width;
      let x = 0;
      let y = position - width;
      let w = context.canvas.width;
      let h = 2 * width;
      if (this.vertical) {
        x = position - width;
        y = 0;
        w = 2 * width;
        h = context.canvas.height;
      }
      if (this.over) {
        context.shadowColor = 'rgba(255,255,255,.5)';
        context.shadowBlur = 1;
        context.lineWidth = 2 * width;
        context.strokeStyle = 'rgba(255,255,255,.5)';
        context.strokeRect(x, y, w, h);
        context.shadowBlur = 0;
      }
      context.lineWidth = width;
      context.strokeStyle = this.color;
      context.strokeRect(x, y, w, h);

      context.restore();
    }
  }

  Over(mouse) {
    const width = Math.max(1, RenderInfo.Zoom(1));
    const position = this.Position();
    if (this.vertical) {
      this.over = mouse.x >= position - width && mouse.x <= position + width;
    } else {
      this.over = mouse.y >= position - width && mouse.y <= position + width;
    }
    return this.over;
  }

  MoveTo(mouse) {
    const location = this.vertical
      ? RenderInfo.UnZoom(mouse.x - RenderInfo.offset.x)
      : RenderInfo.UnZoom(mouse.y - RenderInfo.offset.y);
    this.value = (location * this.ppi) / PPI + this.offset;
  }

  Drop() {
    this.onChange();
  }

  UIState() {
    return {
      over: this.over ? 'on' : 'off',
      value: this.value,
    };
  }
}
