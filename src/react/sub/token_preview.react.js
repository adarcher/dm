import { observer } from 'mobx-react';
import React, { useEffect, useRef } from 'react';

const TokenPreview = props => {
  const token = props.token;

  const t_ref = useRef();

  const init = useEffect(() => {
    const width = token.source.width;
    const height = token.source.height;
    const canvas = t_ref.current;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.width = width;
    context.height = height;
    context.drawImage(token.source.canvas, 0, 0);
  }, [token.source]);

  return <canvas className='token-image-preview' ref={t_ref} />;
};

// TokenPreview.displayName = 'TokenPreview';

export default observer(TokenPreview);
