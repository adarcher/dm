import React, { useState } from 'react';
import { ButtonGroup, FormGroup, Collapse, Tag } from '@blueprintjs/core';
import { invertIcon, cloudIcon } from '../../misc/icons.react';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { SInputNumber } from '../../components/small_input.react';
import SButton from '../../components/small_button.react';
import { GridSizer } from '../../../renderables/widgets/grid_sizer';

const GridInfo = props => {
  const layer = props.layer;

  const [grid, SetGrid] = useState(() => false);
  const [fog, SetFog] = useState(() => false);
  const [lock, SetLock] = useState(() => false);

  const lock_icon = lock ? 'lock' : 'unlock';
  const fog_icon = fog ? 'cloud' : cloudIcon;

  const width = useMemo(() => layer.grid.width);
  const handleGridWidth = event => {
    layer.grid.width = Number.parseInt(event.target.value);
    GridSizer.Drop();
  };
  const height = useMemo(() => layer.grid.height);
  const handleGridHeight = event => {
    layer.grid.height = Number.parseInt(event.target.value);
    GridSizer.Drop();
  };

  return (
    <React.Fragment>
      <FormGroup>
        <ButtonGroup>
          <SButton onClick={() => SetGrid(!grid)} text='Grid' />
          <SButton
            onClick={() => SetLock(!lock)}
            icon={lock_icon}
            title='Lock/Unlock'
          />
          <SButton icon='eye-open' title='Show/Hide' />
          <SButton
            onClick={() => SetFog(!fog)}
            icon={fog_icon}
            title='Fog On/Off'
          />
          <SButton icon='eraser' title='Reset' disabled={!fog} />
          <SButton icon={invertIcon} title='Invert' disabled={!fog} />
          <SButton
            icon={invertIcon}
            title='Invert'
            onClick={layer.OnResizeGrid}
          />
        </ButtonGroup>
        <Collapse isOpen={grid}>
          <FormGroup
            className='formatted double-num'
            inline={false}
            label='Offset'
          >
            <Tag className='small-number' icon='caret-right' minimal={true}>
              {layer.background.offset.x}
            </Tag>
            <Tag className='small-number' icon='caret-down' minimal={true}>
              {layer.background.offset.y}
            </Tag>
          </FormGroup>
          <FormGroup
            className='formatted double-num'
            inline={false}
            label='PPI'
          >
            <Tag className='small-number' icon='caret-right' minimal={true}>
              {layer.background.ppi.x}
            </Tag>
            <Tag className='small-number' icon='caret-down' minimal={true}>
              {layer.background.ppi.y}
            </Tag>
          </FormGroup>
          <FormGroup
            className='formatted double-num'
            inline={false}
            label='Size'
          >
            <SInputNumber
              value={width}
              onChange={handleGridWidth}
              className='small-number'
              leftIcon='arrows-horizontal'
            />
            <SInputNumber
              value={height}
              onChange={handleGridHeight}
              className='small-number'
              leftIcon='arrows-vertical'
            />
          </FormGroup>
        </Collapse>
      </FormGroup>
    </React.Fragment>
  );
};

export default observer(GridInfo);
