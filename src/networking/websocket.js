import { observable } from 'mobx';

// Connection state
const CONNECTING = 'connecting';
const CONNECTED = 'connected';
const DISCONNECTED = 'disconnected';
const DELAYED = 'delayed';

// Room id range
const MAX_ID = 2176782335; // ZZZZZZ
const MIN_ID = 60466176; // 100000

// Room id prefix
// TBD: grab the current hostname or something
const PREFIX = 'adarcher_dm_';
class NetworkingSingleton {
  constructor() {
    console.log('NetworkingSingleton Instance Created.');
  }

  // We do websockets through peerjs @ peerjs.com
  peer = undefined;
  id = undefined;
  heartbeat_id = undefined;
  heartrate = 5000;
  state = CONNECTING;

  // For debuggin locally, set to 3 for very verbose
  DEBUG = 0; //3;

  @observable connections = [];

  GenerateRoomId() {
    const random_value = Math.random();
    const room_id = Math.floor(random_value * (MAX_ID - MIN_ID) + MIN_ID);
    // possibly
    return room_id.toString(36).toUpperCase();
  }

  // This appends our app identification
  // They use to have app_ids, not sure why they are gone
  FormatRoomId(id) {
    return id && !`${id}`.startsWith(PREFIX) ? `${PREFIX}${id}` : id;
  }

  Init(id = undefined) {
    if (Peer == undefined) {
      console.log(`ERROR: peerjs is not loaded.`);
      console.log(` Make sure you are add it as <script/> line in index.html.`);
      return;
    }
    this.id = id || this.id;
    if (this.peer) {
      this.peer.destroy();
    }
    id = this.FormatRoomId(this.id);
    console.log(`WebSocket: Init with [${id}]`);
    this.peer = new Peer(id, {
      host: 'dmpeer.herokuapp.com',
      path: '/myapp',
      secure: true,
      // port: 80,
      debug: this.DEBUG,
    });
    // TBD: Add events...
  }

  customDataIn = false;

  HostDataIn = (data, connection) => {};

  DataIn(data, connection) {
    this.state = CONNECTED;

    if (data == 'ping') {
      connection.send('pong');
    } else if (data == 'connect') {
      connection.send('connected');
    }

    if (this.customDataIn) {
      this.customDataIn(data, connection);
    }
  }

  ClientHeartBeat = () => {
    // A very rough reconnect check.
    //  - when CONNECTING/CONNECTED, send a ping: => DELAYED
    //  - when DELAYED, we missed a pong: shutdown, => DISCONNECTED
    //  - when DISCONNECTED, re-init: => CONNECTING
    switch (this.state) {
      case DELAYED: {
        if (this.peer) {
          this.peer.destroy();
        }
        this.state = DISCONNECTED;
        break;
      }
      case DISCONNECTED: {
        this.ReJoin();
        this.state = CONNECTING;
        break;
      }
      default: {
        this.Send('ping');
        this.state = DELAYED;
      }
    }
  };

  ListenToConnection(connection) {
    // Figure out a better way to clean up connections?
    this.connections.forEach(current_conn => {
      if (connection.peer == current_conn.peer) {
        current_conn.close();
      }
    });
    this.connections = this.connections.filter(
      current_conn => current_conn.peer != connection.peer
    );

    // Setup events
    connection.on('open', () => {
      console.log(`WebSocket Connection(${connection.peer}) open.`);
      this.state = CONNECTED;
      connection.send('connect');
      this.connections.push(connection);
    });
    connection.on('data', data => {
      this.DataIn(data, connection);
    });
    connection.on('error', err => {
      console.log(`WebSocket error(${connection.peer}): ${err}`);
    });
    connection.on('disconnected', () => {
      console.log(`WebSocket Connection(${connection.peer}) disconnection.`);
      this.connections.splice(this.connections.find(connection), 1);
    });
    connection.on('close', () => {
      console.log(`WebSocket Connection(${connection.peer}) closed.`);
    });
  }

  JoinRoom(id) {
    // Check id
    if (!id) {
      console.log(`WebSocket JoinRoom with no id.`);
      return;
    }
    // setup join
    this.id = undefined;
    this.Init();
    if (this.peer) {
      clearInterval(this.heartbeat_id);
      this.connections.forEach(old_connection => old_connection.close());
      this.connections = [];
      this.join_id = this.FormatRoomId(id);
      console.log(`WebSocket: Connect to [${this.join_id}]`);
      var connection = this.peer.connect(this.join_id);

      this.ListenToConnection(connection);

      this.heartbeat_id = setInterval(this.ClientHeartBeat, this.heartrate);
    }
  }

  ReJoin() {
    console.log(`WebSocket: Attempt to rejoin ${this.join_id}`);
    if (this.peer) {
      this.JoinRoom(this.join_id);
    }
  }

  OpenRoom(id) {
    this.id = id;
    this.Init(id);
    if (this.peer) {
      this.peer.on('open', () => {
        clearInterval(this.heartbeat_id);
        this.heartbeat_id = setInterval(this.HostHeartBeat, this.heartrate);
      });

      // Close old connections
      this.connections.forEach(connection => connection.close());
      this.connections = [];

      this.peer.on('connection', connection => {
        console.log(`WebSocket Connecting: ${connection.peer}`);

        this.ListenToConnection(connection);
      });
    }
  }

  HostHeartBeat = () => {
    if (this.peer) {
      if (this.peer.disconnected) {
        console.log('WebSocket Reconnecting...');
        this.peer.reconnect();
      }
    }
  };

  Send(data, exclude = []) {
    if (this.peer) {
      this.connections.forEach(connection => {
        if (connection.open && !exclude.some(c => c == connection)) {
          connection.send(data);
        }
      });
    }
  }

  update_calls = [];
  Update(func, interval) {
    var update_call = this.update_calls.find(c => c.func == func);
    if (!update_call || update_call.interval != interval) {
      this.ClearUpdate(func);
      this.update_calls.push({
        func: func,
        interval: interval,
        id: setInterval(func, interval),
      });
    }
  }

  ClearUpdate(func) {
    var update_call = this.update_calls.find(c => c.func == func);
    if (update_call) {
      clearInterval(update_call.id);
    }
  }
}

export let Networking = new NetworkingSingleton();