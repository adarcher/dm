import React from 'react';
import { Renderer } from '../renderer';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import Enum from '../misc/enum';
import { Networking } from '../networking/websocket';
import { GameRoom } from '../gameroom';
import DMHeader from './sub/dm_header.react';
import { TOOLSET } from '../misc/constants';
import DMToolsLeft from './sub/dm_tools_left.react';
import { EnableInput } from '../inputs';
import DMInfo from './sub/dm_info.react';
import Host from '../networking/host';
import Join from '../networking/join';

const Modes = Enum(['Welcome', 'Host', 'View', 'Player']);

@observer
export class Screen extends React.Component {
  constructor(props) {
    super(props);

    // GameRoom.LoadFromDisk();

    this.user_id = Networking.GenerateRoomId();
    window.requestAnimationFrame(this.Draw);

    if (props.join) {
      console.log(`JOIN: ${props.join}`);
      this.join_id = props.join;
      // this.mode = Modes.Join;
    }
  }

  componentDidMount() {
    EnableInput(this.input_ref.current);
  }

  // This is the 2d canvas reference for rendering the game
  @observable canvas_ref = React.createRef();
  @observable input_ref = React.createRef();

  Draw = () => {
    Renderer.Render(this.canvas_ref.current);
    window.requestAnimationFrame(this.Draw);
  };

  user_id = undefined;
  join_id = 0;
  user_name = '';

  @observable _mode = Modes.Welcome;

  set mode(val) {
    // Add Shutdown here if needed
    this._mode = val;
    console.log(`Switch mode: ${this._mode}`);
    switch (this._mode) {
      case 'Host':
        Host.Setup(this.user_id);
        break;
      case 'Join':
        Join.Setup(this.user_name, this.join_id);
        break;
    }
  }
  get mode() {
    return this._mode;
  }

  /// New stuff
  @observable toolset = TOOLSET.None;

  render() {
    return (
      <React.Fragment>
        <canvas
          className='sceen_element'
          id='canvas_tabletop'
          ref={this.canvas_ref}
        />
        <div className='sceen_element' id='input' ref={this.input_ref} />
        <div id='ui_container'>
          <DMHeader screen={this} />
          <div className='test'>
            <DMToolsLeft screen={this} />
          </div>
        </div>
        <DMInfo screen={this} />
      </React.Fragment>
    );
  }
}
