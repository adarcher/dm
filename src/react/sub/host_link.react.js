import { observer } from 'mobx-react';
import React from 'react';
import { ButtonGroup } from '@blueprintjs/core';
import SButton from '../components/small_button.react';

const HostLink = props => {
  const id = props.id;

  const Clipboard = text => navigator.clipboard.writeText(text);

  const CopyID = () => Clipboard(id);

  const CreateJoinLink = () => {
    const link = `${window.location.toString()}?join=${id}`;
    Clipboard(link);
  };

  return (
    <ButtonGroup>
      <SButton text={id} icon='clipboard' onClick={CopyID} />
      <SButton icon='link' onClick={CreateJoinLink} />
    </ButtonGroup>
  );
};

export default HostLink;
