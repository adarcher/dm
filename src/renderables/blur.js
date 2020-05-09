import {observable} from 'mobx';

export default class Blur {
  @observable spread = 2;
  canvas = document.createElement('canvas');
  constructor(spread) {
    this.spread = spread;
  }

  Draw(context) {
    const blur_context = this.canvas.getContext('2d');
    blur_context.canvas.width = context.canvas.width + (2 * this.spread);
    blur_context.canvas.height = context.canvas.height + (2 * this.spread);

    blur_context.fillStyle = 'black';
    blur_context.fillRect(
        0, 0, blur_context.canvas.width, blur_context.canvas.height);
    blur_context.filter = 'blur(' + this.spread + 'px)';
    blur_context.drawImage(context.canvas, this.spread, this.spread);

    context.drawImage(this.canvas, -this.spread, -this.spread);
  }
}