import Enum from '../../misc/enum';
import { TOKEN_TEXT_SIZE, PPI, SVG_DUMMY } from '../../misc/constants';
import { observable } from 'mobx';
import { useState, useMemo } from 'react';
import { Intent } from '@blueprintjs/core';
import { RenderInfo } from '../../render_info';
import { Renderer } from '../../renderer';

export const SourceState = Enum(['Loaded', 'Invalid', 'Loading']);

class Source {
  get width() {
    return this.canvas.width;
  }
  get height() {
    return this.canvas.height;
  }

  #data = false;
  get data() {
    if (!this.#data) {
      //   this.#data = this.canvas.toDataURL();
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

class IS extends Source {
  // Don't allow reassigning url
  constructor(url) {
    super();
    this.#url = url;
  }
  canvas = document.createElement('canvas');
  image = new Image();
  #url = '';
  @observable state = SourceState.Loading;

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
}

const image_lookup = {};
export const ImageSource = url => {
  var img = image_lookup[url];
  if (!img) {
    img = new IS(url);
    img.Load();
    image_lookup[url] = img;
  }
  return img;
};

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
      context.strokeStyle = this.color;
      context.lineWidth = (3 * scale) / PPI;
      const p = new Path2D(this.path);
      const shape = new Path2D();
      const transform = SVG_DUMMY.createSVGMatrix()
        .translate(x, y)
        .scale(scale / this.ppi);
      shape.addPath(p, transform);
      context.stroke(shape);
      context.globalAlpha = 0.5;
      context.fill(shape);
      this.state = SourceState.Loaded;
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
  @observable state = SourceState.Loading;

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
    this.canvas;
  }
}

const path_lookup = {};
export const PathSource = path_info => {
  const key = JSON.stringify(path_info);
  var path = path_lookup[key];
  if (!path) {
    path = new P(path_info);
    path.Load();
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
  @observable state = SourceState.Loading;

  get name() {
    return this.#name;
  }

  Load() {
    new Promise(resolve => {
      this.canvas.width = 192;
      this.canvas.height = 192;
      this.canvas.id = `TOKEN_${this.#name}`;

      const context = this.canvas.getContext('2d');
      context.font = `bold ${TOKEN_TEXT_SIZE}px serif`;
      context.fillStyle = 'black';
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      context.fillText(this.#name, 192 / 2, 192 * 0.55);

      resolve();
    });
  }
}

export const InitialsSource = name => {
  const n = name.substr(0, 2);
  var ini = initials_lookup[n];
  if (!ini) {
    ini = new Ini(n);
    ini.Load();
    initials_lookup[n] = ini;
  }
  return ini;
};

export function useUrl(obj) {
  const [url, setURL] = useState(() => obj.url);
  const is = useMemo(() => ImageSource(obj.url));
  const [image_tmp_delay, SetImageTmpDelay] = useState(0);
  const urlValid = useMemo(() => {
    switch (is.state) {
      case SourceState.Loaded:
        return Intent.NONE;
      case SourceState.Loading:
        return Intent.WARNING;
      default:
        return Intent.DANGER;
    }
  });
  const handleURL = event => {
    clearTimeout(image_tmp_delay);
    const val = event.target.value;
    SetImageTmpDelay(setTimeout(() => (obj.url = val), 1000));
    setURL(val);
  };

  return [url, urlValid, handleURL];
}
