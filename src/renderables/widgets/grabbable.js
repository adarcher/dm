import { observable } from 'mobx';

export default function Grabbable(c) {
  // Render variables
  observable(c.prototype, 'over', { value: false });
  observable(c.prototype, 'visible', { value: true });

  Object.defineProperty(c.prototype, 'locked', {
    get: function locked() {
      return this.lock || false;
    },
  });

  c.prototype.Lock = function () {
    console.log('lock');
    this.lock = true;
  };

  c.prototype.Unlock = function () {
    console.log('unlock');
    this.lock = false;
  };

  // Manipulation functions
  c.prototype.Over =
    c.prototype.Over ||
    function (context) {
      return false;
    };
  c.prototype.MoveTo = c.prototype.MoveTo || function (context) {};
  c.prototype.Pickup =
    c.prototype.Pickup ||
    function (context) {
      this.Lock();
    };
  c.prototype.Drop =
    c.prototype.Drop ||
    function (context) {
      this.Unlock();
    };

  c.prototype.UIState =
    c.prototype.UIState ||
    function () {
      return this.over ? 'on' : 'off';
    };
}
