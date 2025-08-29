import { parse } from 'node:url';
import { createServer, Server, IncomingMessage, ServerResponse } from 'node:http';
import next from 'next';
import { Socket } from 'node:net';
import { initWebSocketServer } from '@/lib/ws';

const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
    handle(req, res, parse(req.url || '', true));
  });

  const wss = initWebSocketServer();

  server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
    const { pathname } = parse(req.url || "/", true);

    if (pathname === "/_next/webpack-hmr") {
      nextApp.getUpgradeHandler()(req, socket, head);
    }

    if (pathname === "/api/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
  })

  server.listen(3000);
  console.log('Server listening on port 3000');
})
