import { RenderInfo } from '../render_info';
import { PPI, PING_DURATION } from '../misc/constants';
import Color from 'color';

export const DrawPing = (context, p, render_info) => {
  const { x, y, color, start, end } = p;

  const now = Date.now();
  const t = 1 - (now - start) / (end - start);

  if (t >= 0 && t <= 1) {
    const left = render_info.Zoom(x) + render_info.offset.x;
    const top = render_info.Zoom(y) + render_info.offset.y;

    const size = (0.1 + (1 - t) * 0.9) * PPI;

    const center_x = Math.min(Math.max(0, left), render_info.width);
    const center_y = Math.min(Math.max(0, top), render_info.height);
    context.beginPath();
    context.arc(center_x, center_y, size / 2, 0, 6.28, false);
    context.closePath();

    let fill_color = Color(color).fade(1 - t);
    context.stokeStyle = color;
    context.fillStyle = fill_color.string();

    context.fill();
    context.stroke();
  }
};

export const AddPing = ({ x, y, color }) => {
  const now = Date.now();
  RenderInfo.pings.push({
    x: x,
    y: y,
    color: color,
    start: now,
    end: now + PING_DURATION,
  });
};
