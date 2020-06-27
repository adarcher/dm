import { GameRoom } from './gameroom';
import { Brush } from './renderables/brush';
import { Networking } from './networking/websocket';
import Ping from './renderables/misc/ping';
import { Renderer } from './renderer';

export const EnableInput = (dom, render_context) => {
  console.log(`Enabling input listeners on: ${dom}`);
  // Collect MouseEvent data
  const EventData = event => {
    event.preventDefault();
    return {
      info: render_context,
      location: {
        x: event.offsetX,
        y: event.offsetY,
        cx: event.target.clientWidth / 2,
        cy: event.target.clientHeight / 2,
        up: (event.wheelDelta || -event.deltaY) > 0,
      },
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
        Renderer.Update(data, data.location.up);
      } else {
        Renderer.setZoom(data.location.up);
      }
      lastwheel = now;
    }
  };

  dom.onmousedown = event => {
    const data = EventData(event);

    const held = Renderer.widgets.filter(object => object.over);
    if (held.length == 0) {
      const held_token = LayerTokens()
        .filter(object => object.over)
        .pop();
      if (held_token) {
        held.push(held_token);
      }
    }
    Renderer.held = held;
    held.forEach(object => object.Pickup());
    if (held.length == 0) {
      Brush.active = true;
      if (!Brush.Paint(data) && GameRoom.dm) {
        render_context.pan_offset = {
          offset: render_context.offset,
          pan_from: data.location,
        };
      }
    }
  };

  dom.onmouseup = event => {
    const data = EventData(event);

    if (Renderer.held.length == 0) {
      render_context.Update(data);

      // TODO: Clean this up
      if (
        event.type != 'mouseleave' &&
        (!render_context.pan_offset ||
          render_context.pan_offset.offset == render_context.offset)
      ) {
        let ping = {
          x: render_context.location.x,
          y: render_context.location.y,
          color: GameRoom.player.color,
        };
        Ping.Add(ping);
        Networking.Send({ ping: ping });
      }

      render_context.pan_offset = false;
    } else {
      Renderer.held.forEach(object => object.Drop());
      Renderer.held = [];
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
      render_context.Update(data);
      if (Renderer.held.length == 0) {
        Brush.Paint(data);
        Renderer.widgets.forEach(object => object.Over(data));
        LayerTokens().forEach(object => object.Over(data));
      } else {
        Renderer.held.forEach(object => object.MoveTo(data));
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
