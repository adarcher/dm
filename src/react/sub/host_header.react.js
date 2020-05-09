import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Navbar,
  NavbarGroup,
  NavbarDivider,
  Button,
  Alignment,
  ButtonGroup,
  Popover,
  Menu,
  MenuItem,
  Card,
  Spinner,
  Callout,
} from '@blueprintjs/core';
import {
  cloudIcon,
  iceIcon,
  earthIcon,
  windIcon,
  errorIcon,
  waterIcon,
  fireIcon,
} from '../misc/icons.react';
import { RenderInfo } from '../../render_info';
import { ImportRoom } from './host_components/import.react';
import { GameRoom } from '../../gameroom';
import { GROUND_EFFECTS } from '../../misc/constants';
import { Brush, BrushFogStyle, BrushStyle } from '../../renderables/brush';
import { Networking } from '../../networking/websocket';
import {
  ImageSource,
  SourceState,
} from '../../renderables/game_objects/image_source';
import SButton from '../components/small_button.react';
import ImageQueue from './image_queue.react';

const HostHeader = observer(props => {
  const zoom = useMemo(() => RenderInfo.zoom, [RenderInfo.zoom]);

  const show_sizer = useMemo(() => props.gridSizer.visible);
  const show_grid = useMemo(() => RenderInfo.grid_on);

  const queue = useMemo(() =>
    Object.values(ImageSource.cache).filter(
      is => is.state == SourceState.Loading
    )
  );

  return (
    <>
      <Navbar style={{ pointerEvents: 'all' }}>
        <NavbarGroup align={Alignment.LEFT}>
          <Button
            small={true}
            text={Networking.id}
            icon='clipboard'
            onClick={() => navigator.clipboard.writeText(Networking.id)}
          />
          <NavbarDivider />
          <ButtonGroup>
            <Button
              small={true}
              icon='floppy-disk'
              onClick={() => GameRoom.SaveToDisk()}
            />
            <Popover content={<ImportRoom />} minimal={true}>
              <Button small={true} icon='import' />
            </Popover>
            <Button small={true} icon='export' onClick={GameRoom.Export} />
          </ButtonGroup>
          <NavbarDivider />
          <ButtonGroup>
            <Button small={true} icon='undo' disabled={true} />
            <Button small={true} icon='redo' disabled={true} />
          </ButtonGroup>
          <NavbarDivider />
          <ButtonGroup>
            <Button
              small={true}
              icon='hand'
              active={Brush.style == BrushStyle.None}
              onClick={() => (Brush.style = BrushStyle.None)}
            />
            <Button
              small={true}
              icon='cloud'
              active={Brush.style == BrushStyle.Fog}
              onClick={() => (Brush.style = BrushStyle.Fog)}
            />
            <Button
              small={true}
              icon='media'
              active={Brush.style == BrushStyle.Paint}
              onClick={() => (Brush.style = BrushStyle.Paint)}
            />
            <BrushOptions {...props} />
          </ButtonGroup>
          <NavbarDivider />
          <ButtonGroup>
            <Button
              small={true}
              icon='grid'
              active={show_sizer}
              onClick={() => (props.gridSizer.visible = !show_sizer)}
            />
            <Button
              small={true}
              icon='grid-view'
              active={show_grid}
              onClick={() => (RenderInfo.grid_on = !show_grid)}
            />
          </ButtonGroup>
          <ButtonGroup></ButtonGroup>
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Button
            small={true}
            icon='zoom-to-fit'
            text={`${(zoom * 100).toFixed(2)}%`}
            onClick={() => RenderInfo.setZoom(1)}
          />
        </NavbarGroup>
      </Navbar>
      <ImageQueue {...props} />
    </>
  );
});

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
          <Button small={true} icon={FogOptions[fog]} rightIcon='caret-down' />
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
          <Button
            small={true}
            icon={PaintOptions[paint]}
            rightIcon='caret-down'
          />
        </Popover>
      );
    case BrushStyle.None:
    default:
      return (
        <Button
          small={true}
          icon='blank'
          disabled={true}
          rightIcon='caret-down'
        />
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

export default HostHeader;

// <Callout className='queue-item' icon={<Spinner size={20} />}>
//   {is.url}
// </Callout>
