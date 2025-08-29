import { WebSocket, WebSocketServer } from 'ws';

declare global {
  var wss: WebSocketServer;
  var ws_clients: Set<WebSocket>;
}

export function initWebSocketServer() {
  if (!global.wss) {
    global.wss = new WebSocketServer({ noServer: true });
    global.ws_clients = new Set();
  }

  global.wss.on('connection', (ws: WebSocket) => {
    global.ws_clients.add(ws);
    console.log('New client connected');

    ws.on('message', (message: Buffer, isBinary: boolean) => {
      console.log(`Message received: ${message}`);
      global.ws_clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && (message.toString() !== `{"event":"ping"}`)) {
          client.send(message, { binary: isBinary });
        }
      });
    })

    ws.on('close', () => {
      global.ws_clients.delete(ws);
      console.log('Client disconnected');
    });
  });

  return global.wss;
}

// Broadcast to all connected clients
export function broadcast(data: any) {
  if (!global.wss) return;

  const msg = JSON.stringify(data);
  global.ws_clients.forEach(client => {
    console.log(`${msg}`)
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}
