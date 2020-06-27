import { Networking } from './websocket';
import { GameRoom } from '../gameroom';
import Player from '../renderables/game_objects/player';
import { GridSizer } from '../renderables/widgets/grid_sizer';
import Ping from '../renderables/misc/ping';
import { Renderer } from '../renderer';

const SendGameState = state => {
  Networking.Send({ game: state });
};

const HostDataIn = (data, connection) => {
  if (data == 'connected') {
    console.log(`Send first state: ${connection.peer}`);
    connection.Send({ game: GameRoom.previous_state });
  }

  if (data.player) {
    let player = GameRoom.players.find(p => p.name == data.player.name);
    if (!player) {
      player = new Player();
      GameRoom.players.push(player);
    }
    player.Load(data.player);
    player.conn = connection;

    const token = GameRoom.tokens.find(t => t.name == player.name);
    if (token) {
      token.Load(data.player);
    }
  }

  if (data.ping) {
    // Send off ping
    Ping.Add(data.ping);
    Networking.Send({ ping: data.ping }, [connection]);
  }
};

const SetupHost = id => {
  console.log(`Host Room(${id})`);

  GameRoom.dm = true;
  GameRoom.LoadFromDisk();

  // Host render differences
  Renderer.CenterOnGrid(GameRoom.board.focus);
  Renderer.fog_color = 'rgba(0,0,0,.75)';
  Renderer.widgets.push(GridSizer);

  Networking.customDataIn = HostDataIn;
  Networking.OpenRoom(id);

  GameRoom.SubscribeToStateChange('host', SendGameState);
};

const ShutdownHost = () => {
  GameRoom.UnSubscribeToStateChange('host');
};

const Host = { Setup: SetupHost, Shutdown: ShutdownHost };

export default Host;
