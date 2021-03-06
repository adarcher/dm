import { action, observable } from 'mobx';
import Node from './node';
import { SVG_DUMMY } from '../../misc/constants';

export default class Fog extends Node {
  canvas = document.createElement('canvas');

  // pattern
  image_sources = [];
  colors = [undefined];

  CoverSource(level) {
    return this.image_sources.length >= level
      ? this.image_sources[level - 1]
      : false;
  }

  Color(level) {
    return this.colors.length >= level ? this.colors[level - 1] : false;
  }

  constructor(width, height, revealing = true) {
    super(0, 0, width, height, 0);
    this.revealing = revealing;

    observable.box(this.state);
    observable(this.children);

    action(this.Split);
  }

  @action
  Add(x, y, r, s = this.levels) {
    // Grow: this is a "big" grow, doubles size and only checks center
    // of radius right now.
    if (x < this.x) {
      var child_a = new Node(
        this.x,
        this.y,
        this.width,
        this.height,
        this.state,
        this.levels
      );
      var child_b = new Node(
        this.x - this.width,
        this.y,
        this.width,
        this.height,
        this.state,
        this.levels
      );
      child_a.children = this.children;
      this.children = [child_a, child_b];
      this.x = this.x - this.width;
      this.width = this.width * 2;
    } else if (x >= this.width + this.x) {
      var child_a = new Node(
        this.x,
        this.y,
        this.width,
        this.height,
        this.state,
        this.levels
      );
      var child_b = new Node(
        this.x + this.width,
        this.y,
        this.width,
        this.height,
        this.state,
        this.levels
      );
      child_a.children = this.children;
      this.children = [child_a, child_b];
      this.width = this.width * 2;
    }
    if (y < this.y) {
      var child_a = new Node(
        this.x,
        this.y,
        this.width,
        this.height,
        this.state,
        this.levels
      );
      var child_b = new Node(
        this.x,
        this.y - this.height,
        this.width,
        this.height,
        this.state,
        this.levels
      );
      child_a.children = this.children;
      this.children = [child_a, child_b];
      this.y = this.y - this.height;
      this.height = this.height * 2;
    } else if (y >= this.height + this.y) {
      var child_a = new Node(
        this.x,
        this.y,
        this.width,
        this.height,
        this.state,
        this.levels
      );
      var child_b = new Node(
        this.x,
        this.y + this.height,
        this.width,
        this.height,
        this.state,
        this.levels
      );
      child_a.children = this.children;
      this.children = [child_a, child_b];
      this.height = this.height * 2;
    }
    super.Add(x, y, r, s);
  }

  @action
  Remove(x, y, r) {
    super.Remove(x, y, r);
  }

  Import(node) {
    if (node.Full()) {
      for (let u = node.x; u < node.x + node.width; u++) {
        for (let v = node.y; v < node.y + node.height; v++) {
          this.ModifySingle(node.state, u, v, false);
        }
      }
    } else {
      node.children.forEach(child => this.Import(child));
    }
  }

  @action
  Clip(x, y, width, height) {
    var old = this.children;
    this.children = [];
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    old.forEach(child => this.Import(child));
    this.Collapse();
  }

  SetPattern(level, context) {
    var image_source = this.CoverSource(level);
    if (image_source) {
      var patternCanvas = image_source.canvas;
      const x = context.info.offset.x;
      const y = context.info.offset.y;
      const scale = context.info.grid_delta / patternCanvas.width;
      const pattern = context.canvas.createPattern(patternCanvas, 'repeat');
      pattern.setTransform(
        SVG_DUMMY.createSVGMatrix().translate(x, y).scale(scale)
      );
      context.canvas.fillStyle = pattern;
    } else {
      context.canvas.fillStyle = this.Color(level) || context.fog_color;
    }
  }

  Draw(context) {
    context.canvas.save();

    context.canvas.globalCompositeOperation = 'source-atop';

    context.canvas.globalAlpha = 1; //current_level / this.levels;

    const fog_rects = this.AddRects();
    fog_rects.sort((a, b) => a.level < b.level);
    const delta = context.info.grid_delta;
    const x_offset = context.info.offset.x;
    const y_offset = context.info.offset.y;
    let current_level = fog_rects[0] ? fog_rects[0].level : 0;

    this.SetPattern(current_level, context);

    fog_rects.forEach(rect => {
      if (rect.level != current_level) {
        current_level = rect.level;
        this.SetPattern(current_level, context);
      }
      const x = Math.round(rect.x * delta + x_offset);
      const y = Math.round(rect.y * delta + y_offset);
      const width = Math.ceil(rect.width * delta);
      const height = Math.ceil(rect.height * delta);
      // // This might be a bit rough
      // context.canvas.globalAlpha = rect.level / this.levels;
      context.canvas.fillRect(x, y, width, height);
    });

    if (this.debug) {
      const fog_boundries = this.AddBoundries();
      context.canvas.lineWith = 3;
      context.canvas.strokeStyle = 'red';
      fog_boundries.forEach(rect => {
        const x = Math.round(rect.x * delta + x_offset);
        const y = Math.round(rect.y * delta + y_offset);
        const width = Math.ceil(rect.width * delta);
        const height = Math.ceil(rect.height * delta);
        context.canvas.strokeRect(x, y, width, height);
      });
    }
    context.canvas.restore();
  }

  Save() {
    var token_array = [];
    this.Tokenize(token_array);
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height,
      levels: this.levels,
      version: this.version,
      tokens: token_array.join(''),
    };
  }

  Load(raw) {
    if (raw.w) {
      this.width = raw.w;
    }
    if (raw.h) {
      this.height = raw.h;
    }
    if (raw.x) {
      this.x = raw.x;
    }
    if (raw.y) {
      this.y = raw.y;
    }
    if (raw.levels) {
      this.levels = raw.levels;
    }
    if (raw.tokens) {
      this.state = 0;
      this.children = [];
      this.ReadToken(raw.tokens.split(''));
    }
  }
}
