// Draw a square grid on a context
// const canvas = document.createElement('canvas');
// // const context = canvas.getContext('2d');
// // var fill = false;

// const setup = {
//   width: 0,
//   color: 'black'
// };

export function Grid(
    layer_context, start, line_width, grid_delta,
    width = layer_context.canvas.width, height = layer_context.canvas.height,
    color = 'black') {
  // // if (!fill || setup.width != line_width || setup.color != color) {
  // const context = canvas.getContext('2d');
  // context.canvas.width = 96;
  // context.canvas.height = 96;
  // context.strokeStyle = color;
  // context.lineWidth = line_width;
  // context.globalAlpha = .5;
  // context.clearRect(0, 0, 96, 96);
  // context.strokeRect(0, 0, 96, 96);

  // setup.width = line_width;
  // setup.color = color;

  // const fill = context.createPattern(canvas, 'repeat');
  // // }

  // const scale = grid_delta / 96;
  // const m = {a: scale, b: 0, c: start.x, d: 0, e: scale, f: start.y};
  // // fill.setTransform(m);
  // const mm = new DOMMatrix();
  // fill.setTransform(mm.translate(start.x, start.y).scale(scale));
  // layer_context.save();
  // layer_context.fillStyle = fill;

  // // layer_context.globalCompositeOperation = 'source-atop';
  // layer_context.fillRect(0, 0, width, height);
  // layer_context.restore();

  layer_context.save();
  layer_context.strokeStyle = color;
  layer_context.lineWidth = line_width;
  layer_context.globalAlpha = .5;

  layer_context.beginPath();
  let x = start.x;
  layer_context.moveTo(x, 0);
  while (x < width) {
    layer_context.lineTo(x, height);
    x = x + grid_delta;
    layer_context.moveTo(x, 0);
  }
  let y = start.y;
  layer_context.moveTo(0, y);
  while (y < height) {
    layer_context.lineTo(width, y);
    y = y + grid_delta;
    layer_context.moveTo(0, y);
  }
  layer_context.stroke();

  layer_context.restore();
}