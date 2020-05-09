import React from 'react';
import { Renderer } from '../renderer';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import Enum from '../misc/enum';
import Host from './modes/host.react';
import Join from './modes/join.react';
import Welcome from './modes/welcome.react';
import { Networking } from '../networking/websocket';
import { GameRoom } from '../gameroom';
import { RenderInfo } from '../render_info';
import { AddPing } from '../renderables/ping';
import Player from '../renderables/game_objects/player';

const Modes = Enum(['Welcome', 'Host', 'View', 'Player']);

@observer
export class Screen extends React.Component {
  constructor(props) {
    super(props);

    this.user_id = Networking.GenerateRoomId();
    window.requestAnimationFrame(this.Draw);
  }

  // This is the 2d canvas reference for rendering the game
  @observable canvas_ref = React.createRef();

  Draw = () => {
    Renderer.Render(this.canvas_ref.current);
    window.requestAnimationFrame(this.Draw);
  };

  user_id = undefined;
  join_id = 0;
  user_name = '';

  @observable mode = Modes.Welcome;

  RenderMode = () => {
    switch (this.mode) {
      case Modes.Host:
        return <Host screen={this} />;
      case Modes.View:
      case Modes.Join:
        return <Join screen={this} />;
      default:
        return <Welcome screen={this} />;
    }
  };

  render() {
    return (
      <React.Fragment>
        <div id='ui_container'>{this.RenderMode()}</div>
        <canvas
          className='sceen_element'
          id='canvas_tabletop'
          ref={this.canvas_ref}
        />
        <div className='sceen_element' id='input' />
      </React.Fragment>
    );
  }

  Host() {
    console.log(`Host Room(${this.user_id})`);

    GameRoom.dm = true;

    Networking.customDataIn = (data, connection) => {
      if (data == 'connected') {
        // GameRoom.CheckState();
        console.log(`Send first state: ${connection.peer}`);
        connection.send({ game: GameRoom.previous_state });
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

    Networking.OpenRoom(this.user_id);

    this.mode = Modes.Host;
  }

  unamed_count = 0;
  Join(room_id, user_name = false) {
    // Add validation here and in join UI
    if (room_id != '0') {
      console.log(`Join Room(${this.room_id})`);
      if (!user_name) {
        user_name = `Unamed_${this.unamed_count}`;
        this.unamed_count = this.unamed_count + 1;
      }
      this.user_name = user_name;
      this.join_id = room_id;

      GameRoom.DeleteBoard(0);

      Player.LoadPlayer(this.user_name);

      Networking.customDataIn = (data, connection) => {
        if (data.game != undefined) {
          const game = data.game;
          console.log('Updating state!');
          GameRoom.Load(game);
          if (game.boards[game.board_id].focus != undefined) {
            RenderInfo.CenterOnGrid(GameRoom.board.focus);
          }
        }

        if (data.ping) {
          // Send off ping
          AddPing(data.ping);
        }
      };

      Networking.JoinRoom(room_id);

      this.mode = Modes.Join;
    }
  }
}
