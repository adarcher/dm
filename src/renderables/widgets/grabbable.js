import { observable } from 'mobx';

export default function Grabbable(clazz) {
  // Render variables
  observable(clazz.prototype, 'over', { value: false });
  observable(clazz.prototype, 'visible', { value: true });

  Object.defineProperty(clazz.prototype, 'locked', {
    get: function locked() {
      return this.lock || false;
    },
  });

  clazz.prototype.Lock = function () {
    console.log('lock');
    this.lock = true;
  };

  clazz.prototype.Unlock = function () {
    console.log('unlock');
    this.lock = false;
  };

  // Manipulation functions
  clazz.prototype.Over =
    clazz.prototype.Over ||
    function (coord) {
      return false;
    };
  clazz.prototype.MoveTo = clazz.prototype.MoveTo || function (coord) {};
  clazz.prototype.Pickup =
    clazz.prototype.Pickup ||
    function () {
      this.Lock();
    };
  clazz.prototype.Drop =
    clazz.prototype.Drop ||
    function () {
      this.Unlock();
    };

  clazz.prototype.UIState =
    clazz.prototype.UIState ||
    function () {
      return this.over ? 'on' : 'off';
    };
}
