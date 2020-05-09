export default class Node {
  state = 0;
  children = [];
  // Can't be more than 8!  (levels + 1 == "I have children")
  levels = 1;

  constructor(x, y, width, height, state = 0, levels = 1) {
    this.state = state;
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.width = parseInt(width);
    this.height = parseInt(height);
    this.leaf = width == 1 && height == 1;
    this.levels = levels;
  }

  Split() {
    this.children = [];
    if (this.width > this.height) {
      const w1 = Math.round(this.width / 2);
      const w2 = this.width - w1;
      this.children.push(
        new Node(this.x, this.y, w1, this.height, this.state, this.levels)
      );
      this.children.push(
        new Node(this.x + w1, this.y, w2, this.height, this.state, this.levels)
      );
    } else {
      const h1 = Math.round(this.height / 2);
      const h2 = this.height - h1;
      this.children.push(
        new Node(this.x, this.y, this.width, h1, this.state, this.levels)
      );
      this.children.push(
        new Node(this.x, this.y + h1, this.width, h2, this.state, this.levels)
      );
    }
  }

  Invert() {
    this.state = this.levels - this.state + 1; // !this.state;
    this.children.forEach(child => child.Invert());
  }

  Tokenize(token_array) {
    // levels+1 == I've got children
    // [1 - levels] == I'm set
    // 0 == I'm unset
    if (this.children.length > 0) {
      this.children.forEach(child => child.Tokenize(token_array));
      token_array.push(this.levels + 1);
    } else {
      token_array.push(this.state);
    }
  }

  ReadToken(token_array) {
    const token = token_array.pop();
    if (token == this.levels + 1) {
      this.Split();
      // It's only two... for now
      for (var i = this.children.length - 1; i >= 0; i--) {
        var child = this.children[i];
        child.ReadToken(token_array);
      }
    } else {
      this.state = token; //== 1 ? true : false;
      this.children = [];
    }
  }

  Full() {
    return this.children.length == 0;
  }

  State() {
    return this.Full() ? this.state : undefined;
  }

  // TODO: modify this to do non-square collapsing
  Collapse() {
    if (!this.Full()) {
      this.children.forEach(child => child.Collapse());

      const state = this.children[0].State();
      if (state != undefined) {
        if (this.children.every(child => child.State() == state)) {
          this.state = state;
          this.children = [];
        }
      }
    }
  }

  // Not the best, but better than one for each grid
  AddRects(current = []) {
    if (this.Full() && this.state > 0) {
      current.push({
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        level: this.state,
      });
    } else {
      this.children.forEach(child => child.AddRects(current));
    }
    return current;
  }

  AddBoundries(current = []) {
    current.push({
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      level: this.state,
    });
    this.children.forEach(child => child.AddBoundries(current));
    return current;
  }

  ModifySingle(state, x, y, collapse = true) {
    // Early out
    if (
      x < this.x ||
      x >= this.x + this.width ||
      y < this.y ||
      y >= this.y + this.height
    ) {
      return false;
    }

    if (this.leaf) {
      if (this.state != state) {
        this.state = state;
        return true;
      } else {
        return false;
      }
    }

    if (this.Full() && state != this.state) {
      if (this.width > this.height) {
        const w1 = Math.round(this.width / 2);
        const w2 = this.width - w1;
        this.children.push(
          new Node(this.x, this.y, w1, this.height, this.state, this.levels)
        );
        this.children.push(
          new Node(
            this.x + w1,
            this.y,
            w2,
            this.height,
            this.state,
            this.levels
          )
        );
      } else {
        const h1 = Math.round(this.height / 2);
        const h2 = this.height - h1;
        this.children.push(
          new Node(this.x, this.y, this.width, h1, this.state, this.levels)
        );
        this.children.push(
          new Node(this.x, this.y + h1, this.width, h2, this.state, this.levels)
        );
      }
    }
    const changes = this.children.map(child => child.Modify(state, x, y));
    if (collapse) {
      this.Collapse();
    }

    return changes.filter(change => change == true).length > 0;
  }

  // r is really diameter... UUUUUUGG!
  // TODO: just change it to "Size"
  Modify(state, _x, _y, _r = 1) {
    const r = parseInt(_r);
    if (r == 1) {
      return this.ModifySingle(state, _x, _y);
    }
    const x_start = parseInt(_x) - Math.floor(r / 2);
    const y_start = parseInt(_y) - Math.floor(r / 2);
    const x_end = x_start + r;
    const y_end = y_start + r;
    let change = false;
    for (let x = x_start; x < x_end; x++) {
      for (let y = y_start; y < y_end; y++) {
        change |= this.ModifySingle(state, x, y, false);
      }
    }
    this.Collapse();
    return change;
  }

  ModifyArray(state, arr) {
    let change = false;
    arr.forEach(coord => {
      change |= this.ModifySingle(
        state,
        parseInt(coord.x),
        parseInt(coord.y),
        false
      );
    });
    this.Collapse();
    return change;
  }

  Add(x, y, r, state) {
    return this.Modify(state, parseInt(x), parseInt(y), r);
  }
  Remove(x, y, r) {
    return this.Modify(0, parseInt(x), parseInt(y), r);
  }
}
