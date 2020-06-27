import { GRID_WIDTH } from './constants';

export function Grid(context) {
  context.canvas.save();
  context.canvas.strokeStyle = context.color || 'black';
  context.canvas.lineWidth = context.info.Zoom(GRID_WIDTH);
  context.canvas.globalAlpha = 0.5;

  const width = context.canvas.canvas.width;
  const height = context.canvas.canvas.height;

  context.canvas.beginPath();
  let x = context.info.grid_start.x;
  context.canvas.moveTo(x, 0);
  while (x < width) {
    context.canvas.lineTo(x, height);
    x = x + context.info.grid_delta;
    context.canvas.moveTo(x, 0);
  }
  let y = context.info.grid_start.y;
  context.canvas.moveTo(0, y);
  while (y < height) {
    context.canvas.lineTo(width, y);
    y = y + context.info.grid_delta;
    context.canvas.moveTo(0, y);
  }
  context.canvas.stroke();

  context.canvas.restore();
}
