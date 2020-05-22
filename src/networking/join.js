import { Diff } from '../renderables/misc/common';
import { Renderer } from '../renderer';
import { Brush, BrushStyle } from '../renderables/brush';
import { AddPing } from '../renderables/ping';
import { GameRoom } from '../gameroom';
import Player from '../renderables/game_objects/player';
import { Networking } from './websocket';
import { RenderInfo } from '../render_info';

let previous_player_state = false;
const CheckPlayerState = () => {
  const current_player_state = Player.SavePlayer();
  const token = GameRoom.tokens.find(t => t.name == current_player_state.name);
  if (token) {
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

const SetupJoin = (name, id) => {
  console.log(`Join Room(${id})`);
  GameRoom.DeleteBoard(0);

  Player.LoadPlayer(name);

  Networking.customDataIn = (data, connection) => {
    if (data.game != undefined) {
      const game = data.game;
      GameRoom.Load(game);
      if (game.boards[game.board_id].focus != undefined) {
        RenderInfo.CenterOnGrid(GameRoom.board.focus);
      }
    }

    if (data.ping) {
      AddPing(data.ping);
    }
  };

  Networking.JoinRoom(id);

  Brush.style = BrushStyle.None;
  RenderInfo.fog_color = 'rgba(0,0,0,1)';

  GameRoom.SubscribeToCheckState('Player', CheckPlayerState);
};

const ShutdownJoin = () => {
  GameRoom.UnSubscribeToCheckState('Player');
};

const Join = { Setup: SetupJoin, Shutdown: ShutdownJoin };

export default Join;
