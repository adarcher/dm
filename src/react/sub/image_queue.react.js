import React, { useMemo } from 'react';
import {
  ImageSource,
  SourceState,
} from '../../renderables/game_objects/image_source';
import SButton from '../components/small_button.react';
import { Spinner } from '@blueprintjs/core';
import { observer } from 'mobx-react';

const ImageQueue = props => {
  const queue = useMemo(() =>
    Object.values(ImageSource.cache).filter(
      is => is.state == SourceState.Loading
    )
  );

  return (
    <div className='image-queue'>
      {queue.map(is => (
        <ImageQueued key={is.url} {...props} is={is} />
      ))}
    </div>
  );
};

const ImageQueued = props => {
  const is = props.is;
  return (
    <SButton className='queue-item' icon={<Spinner size={15} />}>
      {is.url}
    </SButton>
  );
};

export default observer(ImageQueue);
