import { RenderInfo } from '../render_info';
import { PPI, PING_DURATION } from '../misc/constants';
import Color from 'color';

export const DrawPing = (context, p) => {
  const { x, y, color, start, end } = p;

  const now = Date.now();
  const t = 1 - (now - start) / (end - start);

  if (t >= 0 && t <= 1) {
    const left = RenderInfo.Zoom(x) + RenderInfo.offset.x;
    const top = RenderInfo.Zoom(y) + RenderInfo.offset.y;

    const size = (0.1 + (1 - t) * 0.9) * PPI;

    context.beginPath();
    context.arc(left, top, size / 2, 0, 6.28, false);
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
