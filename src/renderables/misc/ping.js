import { PPI, PING_DURATION } from '../../misc/constants';
import Color from 'color';

export default class Ping {
  constructor({ x, y, color }) {
    const now = Date.now();
    this.x = x;
    this.y = y;
    this.color = color;
    this.start = now;
    this.end = now + PING_DURATION;
  }

  Draw(context, now = false) {
    now = now || Date.now();
    const t = 1 - (now - this.start) / (this.end - this.start);

    if (t >= 0 && t <= 1) {
      const left = context.info.Zoom(this.x) + context.info.offset.x;
      const top = context.info.Zoom(this.y) + context.info.offset.y;

      const size = context.info.PingSize(t);

      const center_x = Math.min(Math.max(0, left), context.info.width);
      const center_y = Math.min(Math.max(0, top), context.info.height);
      context.canvas.beginPath();
      context.canvas.arc(center_x, center_y, size / 2, 0, 6.28, false);
      context.canvas.closePath();

      let fill_color = Color(this.color).fade(1 - t);
      context.canvas.strokeStyle = this.color;
      context.canvas.fillStyle = fill_color.string();

      context.canvas.fill();
      context.canvas.stroke();
    }
  }

  static ping_cache = [];
  static Add(ping) {
    this.ping_cache.push(new Ping(ping));
  }

  static DrawAll(context, now = false) {
    now = now || Date.now();
    this.ping_cache = this.ping_cache.filter(p => p.end > now);
    this.ping_cache.forEach(p => p.Draw(context, now));
  }
}
