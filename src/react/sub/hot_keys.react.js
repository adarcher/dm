import React, { useMemo } from 'react';
import { BrushStyle, BrushFogStyle, Brush } from '../../renderables/brush';
import { GROUND_EFFECTS } from '../../misc/constants';
import { Menu, MenuItem, Popover, ButtonGroup } from '@blueprintjs/core';
import SButton from '../components/small_button.react';
import {
  cloudIcon,
  fireIcon,
  iceIcon,
  waterIcon,
  earthIcon,
  windIcon,
  errorIcon,
} from '../misc/icons.react';
import { observer } from 'mobx-react';

// const FogOptions = {};
// // static Fog = Enum(['Cover', 'Reveal']);
// FogOptions[BrushFogStyle.Cover] = 'cloud';
// FogOptions[BrushFogStyle.Reveal] = cloudIcon;

// const PaintOptions = {};
// // static Paint = Enum(['Fire', 'Clear', 'Ice', 'Rubble', 'Wind', 'Hazzard']);
// PaintOptions['Clear'] = 'eraser';
// PaintOptions[GROUND_EFFECTS.Fire] = fireIcon;
// PaintOptions[GROUND_EFFECTS.Ice] = iceIcon;
// PaintOptions[GROUND_EFFECTS.Water] = waterIcon;
// PaintOptions[GROUND_EFFECTS.Rubble] = earthIcon;
// PaintOptions[GROUND_EFFECTS.Wind] = windIcon;
// PaintOptions[GROUND_EFFECTS.Hazzard] = errorIcon;

// const HotKeys = props => {

//   // For now just Brushes
//   const key1 = props.key1;
//   const key2 = props.key2;
//   const key3 = props.key3;
//   const key4 = props.key4;
//   const key5 = props.key5;

//   const keyProps = (key) => {
//     const options = key.set == BrushStyle.Fog ? FogOptions : PaintOptions;

//     return {icon: options[key.style]
//   }
//   return (
//     <ButtonGroup>
//       <SButton icon='floppy-disk' onClick={() => GameRoom.SaveToDisk()} />
//       <Popover content={<ImportRoom />} minimal={true}>
//         <SButton icon='import' />
//       </Popover>
//       <SButton icon='export' onClick={GameRoom.Export} />
//     </ButtonGroup>
//   );
// };

// export default HotKeys;

const FogOptions = {};
// static Fog = Enum(['Cover', 'Reveal']);
FogOptions[BrushFogStyle.Cover] = 'cloud';
FogOptions[BrushFogStyle.Reveal] = cloudIcon;

const PaintOptions = {};
// static Paint = Enum(['Fire', 'Clear', 'Ice', 'Rubble', 'Wind', 'Hazzard']);
PaintOptions['Clear'] = 'eraser';
PaintOptions[GROUND_EFFECTS.Fire] = fireIcon;
PaintOptions[GROUND_EFFECTS.Ice] = iceIcon;
PaintOptions[GROUND_EFFECTS.Water] = waterIcon;
PaintOptions[GROUND_EFFECTS.Rubble] = earthIcon;
PaintOptions[GROUND_EFFECTS.Wind] = windIcon;
PaintOptions[GROUND_EFFECTS.Hazzard] = errorIcon;

const Options = props => {
  return (
    <Menu>
      {Object.keys(props.items).map(name => (
        <MenuItem
          key={name}
          value={name}
          text={name}
          icon={props.items[name]}
          active={name == props.active}
          onClick={() => props.handle(name)}
        />
      ))}
    </Menu>
  );
};

const BrushOptions = props => {
  const fog = useMemo(() => Brush.fog_style);
  const paint = useMemo(() => Brush.paint_style);

  //const size = useMemo(() => Brush.size);
  switch (Brush.style) {
    case BrushStyle.Fog:
      return (
        <Popover
          content={
            <Options
              items={FogOptions}
              active={fog}
              handle={s => (Brush.fog_style = s)}
              {...props}
            />
          }
          minimal={true}
        >
          <SButton icon={FogOptions[fog]} rightIcon='caret-down' />
        </Popover>
      );
    case BrushStyle.Paint:
      return (
        <Popover
          content={
            <Options
              items={PaintOptions}
              active={paint}
              handle={s => (Brush.paint_style = s)}
              {...props}
            />
          }
          minimal={true}
        >
          <SButton icon={PaintOptions[paint]} rightIcon='caret-down' />
        </Popover>
      );
    case BrushStyle.None:
    default:
      return (
        <SButton icon='blank' disabled={true} rightIcon='caret-down' />
        // <InputGroup
        //   value={size}
        //   onChange={s => (Brush.size = s)}
        //   type='number'
        //   small={true}
        //   icon='star'
        // />
      );
  }
};

const HotKeys = props => {
  return (
    <ButtonGroup>
      <SButton
        icon='hand'
        active={Brush.style == BrushStyle.None}
        onClick={() => (Brush.style = BrushStyle.None)}
      />
      <SButton
        icon='cloud'
        active={Brush.style == BrushStyle.Fog}
        onClick={() => (Brush.style = BrushStyle.Fog)}
      />
      <SButton
        icon='media'
        active={Brush.style == BrushStyle.Paint}
        onClick={() => (Brush.style = BrushStyle.Paint)}
      />
      <BrushOptions {...props} />
    </ButtonGroup>
  );
};

export default observer(HotKeys);
