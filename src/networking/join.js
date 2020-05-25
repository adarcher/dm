import { Diff } from '../renderables/misc/common';
import { Renderer } from '../renderer';
import { Brush, BrushStyle } from '../renderables/brush';
import { GameRoom } from '../gameroom';
import Player from '../renderables/game_objects/player';
import { Networking } from './websocket';
import { RenderInfo } from '../render_info';
import Ping from '../renderables/misc/ping';

let previous_player_state = false;
let last_send = 0;
const CheckPlayerState = () => {
  const now = Date.now();
  const current_player_state = Player.SavePlayer();
  const token = GameRoom.tokens.find(t => t.name == current_player_state.name);
  if (token) {
    token.Load(current_player_state);
    if (token.locked) {
      Object.assign(current_player_state, token.Save());
    }
  }
  let update = false;
  const delta_time = now - last_send;
  if (delta_time > 1000) {
    last_send = now;
    update = true;
  }
  if (previous_player_state) {
    const diff = Diff(previous_player_state, current_player_state, false);
    if (diff) {
      Renderer.dirty = true;
      update = true;
    }
  }
  if (update) {
    Networking.Send({ player: current_player_state });
  }
  previous_player_state = current_player_state;
};

const JoinDataIn = (data, connection) => {
  if (data.game != undefined) {
    const game = data.game;
    GameRoom.LoadRenderState(game);
    GameRoom.Focus();
  }

  if (data.ping) {
    Ping.Add(data.ping);
  }
};

const SetupJoin = (name, id) => {
  console.log(`Join Room(${id})`);
  // Hack to clear screen
  GameRoom.DeleteBoard(0);

  Player.LoadPlayer(name);

  Networking.customDataIn = JoinDataIn;

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
