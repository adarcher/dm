import { Networking } from './websocket';
import { GameRoom } from '../gameroom';
import Player from '../renderables/game_objects/player';
import { AddPing } from '../renderables/ping';
import { RenderInfo } from '../render_info';
import { GridSizer } from '../renderables/widgets/grid_sizer';

const SendGameState = state => {
  Networking.Send({ game: state });
};

const SetupHost = id => {
  console.log(`Host Room(${id})`);

  GameRoom.LoadFromDisk();
  GameRoom.dm = true;

  RenderInfo.widgets.push(GridSizer);

  Networking.customDataIn = (data, connection) => {
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
      AddPing(data.ping);
      Networking.Send({ ping: data.ping }); //, [connection]);
    }
  };

  Networking.OpenRoom(id);

  // GameRoom.LoadFromDisk();
  RenderInfo.CenterOnGrid(GameRoom.board.focus);
  RenderInfo.fog_color = 'rgba(0,0,0,.75)';

  GameRoom.SubscribeToStateChange('host', SendGameState);
};

const ShutdownHost = () => {
  GameRoom.UnSubscribeToStateChange('host');
};

const Host = { Setup: SetupHost, Shutdown: ShutdownHost };

export default Host;
