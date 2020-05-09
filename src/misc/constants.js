import Enum from './enum';

export const PPI = 96;
export const GRID_WIDTH = 4;
export const TOKEN_TEXT_SIZE = 50;
export const TOKEN_BORDER_WIDTH = 1.2 * GRID_WIDTH;

export const FPS_CAP = 60;
export const HZ_CAP = Math.round(1000 / FPS_CAP);

export const PING_DURATION = 1000;

export const MAX_STATES = 50;

export const GROUND_EFFECT_SIZE = 4 * PPI;

export const GROUND_EFFECTS = Enum([
  'Fire',
  'Ice',
  'Water',
  'Rubble',
  'Wind',
  'Hazzard',
]);

export const LS_PREFIX = 'backup_';

export const SVG_DUMMY = document.createElementNS(
  'http://www.w3.org/2000/svg',
  'svg'
);
