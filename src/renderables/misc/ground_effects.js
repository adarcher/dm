import Fog from './fog';
import { GROUND_EFFECTS, GROUND_EFFECT_SIZE } from '../../misc/constants';
import { iconMap } from '../../react/misc/icons.react';
import { PathSource } from '../game_objects/image_source';

export default class GroundEffects extends Fog {
  constructor() {
    super(10, 10);

    const keys = Object.keys(GROUND_EFFECTS);
    const names = keys.map(s => s.toLowerCase());
    this.image_sources = names.map(lc_name => {
      var icon = iconMap[lc_name];

      var path_info = {
        path: icon.path,
        ppi: icon.width,
        size: GROUND_EFFECT_SIZE,
        color: icon.color,
        x: 0.5,
        y: 0.5,
        scale: 0.45,
      };

      return PathSource(path_info);
    });

    this.levels = this.image_sources.length;
  }
}
