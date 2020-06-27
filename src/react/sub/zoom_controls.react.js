import { observer } from 'mobx-react';
import React, { useMemo } from 'react';
import SButton from '../components/small_button.react';
import { Renderer } from '../../renderer';

const ZoomControls = props => {
  const info = useMemo(() => Renderer.screen_info);

  return (
    <SButton
      icon='zoom-to-fit'
      text={`${(info.zoom * 100).toFixed(2)}%`}
      onClick={() => info.setZoom(1)}
    />
  );
};

export default observer(ZoomControls);
