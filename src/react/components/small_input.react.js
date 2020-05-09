import { InputGroup } from '@blueprintjs/core';
import React from 'react';
import { GameRoom } from '../../gameroom';

const SInput = props => {
  return <InputGroup {...props} small={true} />;
};

export const SInputNumber = props => {
  return <SInput {...props} type='number' />;
};

export const SInputDistance = props => {
  return <SInputNumber {...props} step={`${GameRoom.distance_step}`} />;
};

export default SInput;
