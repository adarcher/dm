import React from 'react';
import HostLink from '../host_link.react';
import { Label, FormGroup } from '@blueprintjs/core';

const HostPanel = props => {
  const screen = props.screen;
  const id = screen.user_id;
  return (
    <FormGroup inline={true} label='Share this Room ID' className='formatted'>
      <HostLink id={id} />
    </FormGroup>
  );
};

export default HostPanel;
