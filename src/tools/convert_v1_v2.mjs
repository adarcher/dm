#!/usr/bin/env node
import fs from 'fs';
import MAP from './mapping.mjs';

import { Node } from './fog.mjs';

const filename = process.argv.length > 2 ? process.argv[2] : false;

if (filename) {
  const dm = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const new_dm = { boards: [], board_id: dm.current_map_id };
  new_dm.boards = dm.maps.map(m => {
    const board = {};
    board.name = m.name;
    board.tags = [m.section];
    board.focus = m.center;

    const grid = {
      width: Math.round(m.image_width / m.ppi.x),
      height: Math.round(m.image_height / m.ppi.y),
    };

    board.layers = m.layers.map((l, i) => {
      const layer = {};
      layer.name = `Layer ${i}`;
      layer.visible = l.visible;
      layer.background = {
        url: MAP[l.image] || '',
        ppi: m.ppi,
        offset: m.offset,
      };

      layer.grid = grid;

      const temp = (l.image || '').split('/');
      temp.push('dm.' + temp.pop());
      const dm_image = temp.join('/');
      layer.background_dm = {
        url: MAP[dm_image] || '',
        ppi: m.ppi,
        offset: m.offset,
      };
      layer.tokens = m.tokens
        ? m.tokens.map(t => {
            const token = {};
            token.name = t.name;
            token.x = t.position[0];
            token.y = t.position[1];
            token.url = t.url;
            token.color = t.color;
            token.visible = t.visible;
            token.size = t.size;
            return token;
          })
        : [];

      const fog = {};

      const invert = l.masking.revealing ? 1 : 0;
      const state = invert ? 0 : 1;
      const ys = Object.keys(l.masking.rows).map(y => parseInt(y));
      const y_min = Math.min(0, ...ys);
      const y_max = Math.max(10, ...ys);
      const xs = Object.values(l.masking.rows)
        .flat()
        .flat()
        .flat()
        .filter(x => x != null);
      const x_min = Math.min(0, ...xs);
      const x_max = Math.max(10, ...xs);

      const root = new Node(
        y_min - 5,
        x_min - 5,
        1.5 * (y_max - y_min),
        1.5 * (x_max - x_min),
        invert
      );
      Object.keys(l.masking.rows).forEach(r => {
        const row_sets = l.masking.rows[r];
        const y = parseInt(r);
        row_sets.forEach(cs => {
          const start = parseInt(cs[0]);
          const end = parseInt(cs[1]);
          if (start != null) {
            let x = start;
            for (; x <= end; x++) {
              root.GrowAdd(state, x, y, true);
            }
          }
        });
      });

      root.Collapse();

      fog.x = root.x;
      fog.y = root.y;
      fog.w = root.width;
      fog.h = root.height;
      fog.tokens = [];
      root.Tokenize(fog.tokens);
      fog.tokens = fog.tokens.join('');

      layer.fog = fog;
      return layer;
    });

    board.layers.reverse();

    return board;
  });
  console.log(JSON.stringify(new_dm));
} else {
  console.log(
    'Please include a json fileanme: node convert_v1_v2.js <filename>'
  );
}
