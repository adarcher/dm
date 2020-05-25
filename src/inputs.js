import { GameRoom } from './gameroom';
import { RenderInfo } from './render_info';
import { Brush } from './renderables/brush';
import { Networking } from './networking/websocket';
import Ping from './renderables/misc/ping';

export const EnableInput = dom => {
  console.log(`Enabling input listeners on: ${dom}`);
  // Collect MouseEvent data
  const EventData = event => {
    event.preventDefault();
    return {
      x: event.offsetX,
      y: event.offsetY,
      cx: event.target.clientWidth / 2,
      cy: event.target.clientHeight / 2,
      up: (event.wheelDelta || -event.deltaY) > 0,
    };
  };

  const LayerTokens = () => {
    if (GameRoom.dm) {
      return GameRoom.tokens;
    } else {
      return GameRoom.tokens.filter(t => t.name == GameRoom.player.name);
    }
  };

  // Setup backups
  dom.previous_onmousedown = dom.onmousedown;
  dom.previous_onmouseleave = dom.onmouseleave;
  dom.previous_onmousemove = dom.onmousemove;
  dom.previous_onmouseup = dom.onmouseup;
  dom.previous_onwheel = dom.onwheel;

  // Wheel/Zoom
  let lastwheel = 0;
  dom.onwheel = event => {
    const data = EventData(event);

    // Add a throttle to limit events firering
    const now = Date.now();
    if (now >= lastwheel + 33) {
      if (GameRoom.dm) {
        RenderInfo.Update(data, data.up);
      } else {
        RenderInfo.setZoom(data.up);
      }
      lastwheel = now;
    }
  };

  dom.onmousedown = event => {
    const data = EventData(event);

    const held = RenderInfo.widgets.filter(object => object.over);
    if (held.length == 0) {
      const held_token = LayerTokens()
        .filter(object => object.over)
        .pop();
      if (held_token) {
        held.push(held_token);
      }
    }
    RenderInfo.held = held;
    held.forEach(object => object.Pickup());
    if (held.length == 0) {
      Brush.active = true;
      if (!Brush.Paint() && GameRoom.dm) {
        RenderInfo.pan_offset = {
          offset: RenderInfo.offset,
          pan_from: data,
        };
      }
    }
  };

  dom.onmouseup = event => {
    const data = EventData(event);

    if (RenderInfo.held.length == 0) {
      RenderInfo.Update(data);

      // TODO: Clean this up
      if (
        event.type != 'mouseleave' &&
        (!RenderInfo.pan_offset ||
          RenderInfo.pan_offset.offset == RenderInfo.offset)
      ) {
        let ping = {
          x: RenderInfo.location.x,
          y: RenderInfo.location.y,
          color: GameRoom.player.color,
        };
        Ping.Add(ping);
        Networking.Send({ ping: ping });
      }

      RenderInfo.pan_offset = false;
    } else {
      RenderInfo.held.forEach(object => object.Drop());
      RenderInfo.held = [];
    }
    Brush.active = false;
  };
  dom.onmouseleave = dom.onmouseup;

  var lastmove = 0;
  dom.onmousemove = event => {
    const data = EventData(event);
    const now = Date.now();
    if (now >= lastmove + 16) {
      lastmove = now;
      RenderInfo.Update(data);
      if (RenderInfo.held.length == 0) {
        Brush.Paint();
        RenderInfo.widgets.forEach(object => object.Over(data));
        LayerTokens().forEach(object => object.Over(data));
      } else {
        RenderInfo.held.forEach(object => object.MoveTo(data));
      }
    }
  };
};

export const ResetInput = dom => {
  console.log(`Removing input listeners on: ${dom}`);
  if (dom.dm_inputs) {
    dom.onwheel = dom.previous_onwheel;
    dom.onmousedown = dom.previous_onmousedown;
    dom.onmouseup = dom.previous_onmouseup;
    dom.onmouseleave = dom.previous_onmouseleave;
    dom.onmousemove = dom.previous_onmousemove;
  }
};
