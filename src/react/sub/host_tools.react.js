import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, ButtonGroup } from '@blueprintjs/core';
import Edit from './host_components/edit.react';
import Tokens from './host_components/tokens_panel.react';
import Players from './host_components/players.react';

const HostTools = observer(props => {
  const [edit, SetEdit] = useState(() => false);
  const [players, SetPlayers] = useState(() => false);
  const [mobs, SetMobs] = useState(() => false);
  const [combat, SetCombat] = useState(() => false);

  const handleOpenEdit = () => {
    SetEdit(true);
  };
  const handleOpenPlayers = () => {
    SetPlayers(true);
  };
  const handleOpenMobs = () => {
    SetMobs(true);
  };
  const handleOpenCombat = () => {
    SetCombat(true);
  };

  return (
    <div id='tools'>
      <ButtonGroup vertical={true}>
        <Button onClick={handleOpenEdit}>Edit</Button>
        <Button onClick={handleOpenPlayers}>Players</Button>
        <Button onClick={handleOpenMobs}>Mobs</Button>
        <Button onClick={handleOpenCombat}>Combat</Button>
      </ButtonGroup>
      <Edit {...props} open={edit} SetOpen={SetEdit} />
      <Players {...props} open={players} SetOpen={SetPlayers} />
      <Tokens {...props} open={mobs} SetOpen={SetMobs} />
      {/* <Combat {...props} open={combat} SetOpen={SetCombat} /> */}
    </div>
  );
});
export default HostTools;
