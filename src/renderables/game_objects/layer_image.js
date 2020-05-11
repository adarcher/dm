import { observable } from 'mobx';
import { PPI } from '../../misc/constants.js';
import { RenderInfo } from '../../render_info.js';
import { ImageSource } from './image_source';

export default class LayerImage {
  @observable url = 'https://i.imgur.com/wAzWXr8.jpg';
  @observable ppi = { x: 36.12390420649044, y: 36.12850019628192 };
  @observable offset = { x: 17.312186908549947, y: 11.754145065933258 };
  // @observable rotation = 0;

  get state() {
    return ImageSource.Get(this.url).state;
  }

  get valid() {
    return ImageSource.Get(this.url).valid;
  }

  get size() {
    const ini = ImageSource.Get(this.url);
    if (ini.valid) {
      return {
        width: ini.width,
        height: ini.height,
      };
    }
    return { width: 0, height: 0 };
  }

  Load(raw) {
    if (raw.url != undefined) {
      this.url = raw.url;
    }
    if (raw.ppi != undefined) {
      if (raw.ppi.x != undefined) this.ppi.x = raw.ppi.x;
      if (raw.ppi.y != undefined) this.ppi.y = raw.ppi.y;
    }
    if (raw.offset != undefined) {
      if (raw.offset.x != undefined) this.offset.x = raw.offset.x;
      if (raw.offset.y != undefined) this.offset.y = raw.offset.y;
    }
  }

  Save() {
    return {
      url: this.url,
      ppi: { x: this.ppi.x, y: this.ppi.y },
      offset: { x: this.offset.x, y: this.offset.y },
    };
  }

  Draw(context) {
    var cache = ImageSource.Get(this.url);
    if (cache.valid) {
      const x_offset = RenderInfo.Zoom((this.offset.x / this.ppi.x) * PPI);
      const y_offset = RenderInfo.Zoom((this.offset.y / this.ppi.y) * PPI);
      const x = RenderInfo.offset.x - x_offset;
      const y = RenderInfo.offset.y - y_offset;
      const zoom = RenderInfo.zoom;
      const width = (zoom * cache.width * PPI) / this.ppi.x;
      const height = (zoom * cache.height * PPI) / this.ppi.y;
      context.drawImage(cache.canvas, x, y, width, height);
    }
  }
}
