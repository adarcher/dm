import Enum from '../../misc/enum';
import { TOKEN_TEXT_SIZE, PPI, SVG_DUMMY } from '../../misc/constants';
import { observable, computed } from 'mobx';
import { useState, useEffect } from 'react';
import { Intent } from '@blueprintjs/core';
import { RenderInfo } from '../../render_info';
import { Renderer } from '../../renderer';

export const SourceState = Enum(['Init', 'Loaded', 'Invalid', 'Loading']);

class Source {
  @observable static cache = {};
  @observable state = SourceState.Init;

  get valid() {
    if (this.state == SourceState.Init) {
      this.state = SourceState.Loading;
      this.Load();
    }
    return this.state == SourceState.Loaded;
  }

  Load() {}

  get width() {
    return this.canvas.width;
  }
  get height() {
    return this.canvas.height;
  }

  #data = '';
  get data() {
    if (!this.#data) {
      // // CORS
      // this.#data = this.canvas.toDataURL();
    }
    return this.#data;
  }

  #css = '';
  static source_id = 0;
  get css() {
    if (!this.#css) {
      this.#css = `--Source-${Source.source_id++}`;
      document.documentElement.style.setProperty(
        this.#css,
        `url(${this.data})`
      );
    }
    return this.#css;
  }
}

export class ImageSource extends Source {
  // Don't allow reassigning url
  constructor(url) {
    super();
    this.#url = url;
  }
  canvas = document.createElement('canvas');
  image = new Image();
  #url = '';

  get url() {
    return this.#url;
  }

  Load() {
    // this.image.crossOrigin = 'anonymous';
    console.log(`Load ${this.url}`);
    this.image.onload = () => {
      this.canvas.width = this.image.width;
      this.canvas.height = this.image.height;
      const context = this.canvas.getContext('2d');
      context.drawImage(
        this.image,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.state = SourceState.Loaded;
      Renderer.dirty = true;
    };
    this.image.onerror = () => {
      this.state = SourceState.Invalid;
    };
    this.image.src = this.url;
  }

  static Get = url => {
    const key = `IS: ${url}`;
    var img = this.cache[key];
    if (!img) {
      img = new ImageSource(url);
      this.cache[key] = img;
    }
    return img;
  };
  @computed static get Queue() {
    return Object.values(this.cache).filter(is => is.state == is.Loading);
  }
}

// path_info: <path, size, ppi, color>
class P extends Source {
  constructor({
    path,
    ppi,
    size,
    color = 'black',
    x = 0,
    y = 0,
    scale = 1,
  } = props) {
    super();
    this.#path = path;
    this.#ppi = ppi;
    this.#size = size;
    this.#color = color;
    this.#x = x;
    this.#y = y;
    this.#scale = scale;
  }

  lods = {};

  PowerTwo(val, max = 1024) {
    let power = 1;
    let limit = 1.5 * power;
    while (val > limit && power < 8 && this.#size * power < max) {
      power = power * 2;
      limit = 1.5 * power;
    }
    return power;
  }

  get canvas() {
    const ratio = RenderInfo.grid_delta / 4 / PPI;
    const lod = ratio < 1 ? 1 / this.PowerTwo(1 / ratio) : this.PowerTwo(ratio);
    var c = this.lods[lod];
    if (!c) {
      c = document.createElement('canvas');
      this.lods[lod] = c;
      const size = this.#size * lod;
      const x = this.#x * size;
      const y = this.#y * size;
      const scale = this.#scale * size;
      c.width = size;
      c.height = size;

      const context = c.getContext('2d');
      context.fillStyle = this.color;
      context.strokeStyle = 'black'; //this.color;
      context.lineWidth = (10 * scale) / PPI;
      const p = new Path2D(this.path);
      const shape = new Path2D();
      const transform = SVG_DUMMY.createSVGMatrix()
        .translate(x, y)
        .scale(scale / this.ppi);
      shape.addPath(p, transform);
      context.stroke(shape);
      // context.globalAlpha = 0.5;
      context.fill(shape);
    }
    return c;
  }

  #path;
  #ppi;
  #size;
  #color;
  #x;
  #y;
  #scale;

  get path() {
    return this.#path;
  }
  get ppi() {
    return this.#ppi;
  }
  get size() {
    return this.#size;
  }
  get color() {
    return this.#color;
  }

  Load() {
    // Lazy load lod as needed
    this.state = SourceState.Loaded;
  }
}

const path_lookup = {};
export const PathSource = path_info => {
  const key = JSON.stringify(path_info);
  var path = path_lookup[key];
  if (!path) {
    path = new P(path_info);
    path_lookup[key] = path;
  }
  return path;
};

const initials_lookup = {};
class Ini extends Source {
  constructor(name) {
    super();
    this.#name = name;
  }

  canvas = document.createElement('canvas');
  #name;

  get name() {
    return this.#name;
  }

  Load() {
    this.canvas.width = 192;
    this.canvas.height = 192;
    this.canvas.id = `TOKEN_${this.#name}`;

    const context = this.canvas.getContext('2d');
    context.font = `bold ${TOKEN_TEXT_SIZE}px serif`;
    context.fillStyle = 'black';
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillText(this.#name, 192 / 2, 192 * 0.55);
    this.state = SourceState.Loaded;
  }
}

export const InitialsSource = name => {
  const n = name.substr(0, 2);
  var ini = initials_lookup[n];
  if (!ini) {
    ini = new Ini(n);
    initials_lookup[n] = ini;
  }
  ini.Load();
  return ini;
};

const StateToIntent = state => {
  switch (state) {
    case SourceState.Loaded:
      return Intent.SUCCESS;
    case SourceState.Init:
      return Intent.NONE;
    case SourceState.Loading:
      return Intent.WARNING;
    default:
      return Intent.DANGER;
  }
};

export function useUrl(obj) {
  const [url, setUrl] = useState(obj.url);
  const [urlValid, setUrlValid] = useState(Intent.NONE);
  const [image_tmp_delay, SetImageTmpDelay] = useState(0);

  function handleUrl(event) {
    clearTimeout(image_tmp_delay);
    const val = event.target.value;
    SetImageTmpDelay(setTimeout(() => (obj.url = val), 1000));
    setUrl(val);
    setUrlValid(Intent.WARNING);
  }

  useEffect(() => {
    switch (obj.state) {
      case SourceState.Loaded:
        setUrlValid(Intent.SUCCESS);
        break;
      case SourceState.Init:
        setUrlValid(Intent.NONE);
        break;
      case SourceState.Loading:
        setUrlValid(Intent.WARNING);
        break;
      default:
        setUrlValid(Intent.DANGER);
        break;
    }
  });

  return [url, urlValid, handleUrl, StateToIntent];
}
