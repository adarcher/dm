import React, { useEffect } from 'react';
import Player from '../../renderables/game_objects/player';
import { GameRoom } from '../../gameroom';
import { Diff } from '../../renderables/misc/common';
import { Networking } from '../../networking/websocket';
import { Renderer } from '../../renderer';
import { Brush, BrushStyle } from '../../renderables/brush';
import { EnableInput, ResetInput } from '../../inputs';
import { RenderInfo } from '../../render_info';
import PlayerTools from '../sub/player_tools.react';

let previous_player_state = false;
const CheckPlayerState = () => {
  const current_player_state = Player.SavePlayer();
  const token = GameRoom.tokens.find(t => t.name == current_player_state.name);
  if (token && token.locked) {
    token.Load(current_player_state);
    Object.assign(current_player_state, token.Save());
  }
  if (previous_player_state) {
    const diff = Diff(previous_player_state, current_player_state, false);
    if (diff) {
      Renderer.dirty = true;
      // Check if we've got token data to send
      Networking.Send({ player: current_player_state });
    }
  }
  previous_player_state = current_player_state;
};

export default function Join(props) {
  useEffect(() => {
    Brush.style = BrushStyle.None;

    var input = document.getElementById('input');
    EnableInput(input);

    GameRoom.SubscribeToCheckState('Player', CheckPlayerState);

    return () => {
      ResetInput(input);

      GameRoom.UnSubscribeToCheckState('Player');

      RenderInfo.ExitMode();
    };
  }, []);

  return (
    <React.Fragment>
      <PlayerTools className='ui' {...props} player={GameRoom.player} />
    </React.Fragment>
  );
}
