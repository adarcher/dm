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

  Draw(context, render_info, now = false) {
    now = now || Date.now();
    const t = 1 - (now - this.start) / (this.end - this.start);

    if (t >= 0 && t <= 1) {
      const left = render_info.Zoom(this.x) + render_info.offset.x;
      const top = render_info.Zoom(this.y) + render_info.offset.y;

      const size = render_info.PingSize(t);

      const center_x = Math.min(Math.max(0, left), render_info.width);
      const center_y = Math.min(Math.max(0, top), render_info.height);
      context.beginPath();
      context.arc(center_x, center_y, size / 2, 0, 6.28, false);
      context.closePath();

      let fill_color = Color(this.color).fade(1 - t);
      context.strokeStyle = this.color;
      context.fillStyle = fill_color.string();

      context.fill();
      context.stroke();
    }
  }

  static ping_cache = [];
  static Add(ping) {
    this.ping_cache.push(new Ping(ping));
  }

  static DrawAll(context, render_info, now = false) {
    now = now || Date.now();
    this.ping_cache = this.ping_cache.filter(p => p.end > now);
    this.ping_cache.forEach(p => p.Draw(context, render_info, now));
  }
}
